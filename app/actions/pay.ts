'use server';

import { walletClient, publicClient } from '@/lib/tempo-client';
import { supabase } from '@/lib/supabase';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { parseAmount, generateStructuredMemo, STABLECOINS } from '@/lib/tempo-helpers';



const USDC_ADDRESS = STABLECOINS.alphaUSD; // Default AlphaUSD (USD)

interface PaymentProps {
  gigId: string;
  hash: `0x${string}`;
  amount: number; // Amount in human readable USD (e.g., 500)
  freelancerAddress: `0x${string}`;
  clientAddress: `0x${string}`;
  startTime: number;
}

export async function payAction({ gigId, hash, amount, freelancerAddress, clientAddress, startTime }: PaymentProps) {
  try {
    console.log(`Processing payment for gig ${gigId}... Hash: ${hash}`);
    
    // 1. Verify Transaction Receipt
    // Optimize: Poll every 100ms to catch instant finality (Default is 4s!!)
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash, 
      pollingInterval: 100 
    });
    
    if (receipt.status !== 'success') {
      return { status: 'error', message: 'Transaction failed on-chain' };
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Transaction finalized in ${duration}ms`);

    const amountBigInt = parseAmount(amount); // USD has 6 decimals

    // 2. Check SLA (3000ms)
    // NOTE: In production, rely on block timestamps relative to submission, 
    // but for this MVP, client provided start time + server receipt time is a proxy.
    // A more robust way: Check block.timestamp of the tx block vs "expected" time.
    // Since we promise <3s end-to-end user experience, client-start to server-receipt is fair.
    
    // However, to prevent client spoofing 'startTime', we should ideally track the "intent" 
    // on the server before they sign. 
    // For this MVP Spec: "Use Date.now() for start time; post-tx, check receipt timestamp."
    
    if (duration > 3000) {
      console.log('SLA breached. Initiating Refund...');
      const refundMemo = generateStructuredMemo('REF', gigId, Date.now());

      const refundTx = await walletClient.token.transfer({
        token: USDC_ADDRESS,
        to: clientAddress,
        amount: amountBigInt,
        memo: refundMemo,
      });

      await supabase
        .from('transactions')
        .insert([
          {
            gig_id: gigId,
            client_address: clientAddress,
            freelancer_address: freelancerAddress,
            amount: amount,
            tx_hash: hash,
            status: 'refunded',
            memo: refundMemo
          }
        ]);

      return { status: 'refunded', message: "It's free! (SLA Breached)", duration, tx: refundTx };
    }

    // 4. Success - Forward 99.5% to Freelancer
    const fee = (amountBigInt * 5n) / 1000n; // 0.5% (5/1000)
    const netAmount = amountBigInt - fee;
    const memo = generateStructuredMemo('PAY', gigId, Date.now());

    console.log(`Forwarding ${netAmount.toString()} to ${freelancerAddress}. Fee: ${fee.toString()}. Memo: ${memo}`);

    const forwardTx = await walletClient.token.transfer({
      token: USDC_ADDRESS,
      to: freelancerAddress,
      amount: netAmount,
      memo,
    });

    // 5. Update Status in Supabase
    // We treat 'success' payment as 'paid' status for the gig
    const { error: dbError } = await supabase
      .from('gigs')
      .update({ status: 'paid' })
      .eq('id', gigId);

    if (dbError) {
      console.error("Failed to update gig status:", dbError);
    }

    // 6. Record Transaction History
    const { error: txError } = await supabase
      .from('transactions')
      .insert([
        {
          gig_id: gigId,
          client_address: clientAddress,
          freelancer_address: freelancerAddress,
          amount: amount,
          tx_hash: hash,
          status: 'success',
          memo: memo
        }
      ]);

    if (txError) console.error("Failed to record tx:", txError);

    revalidatePath('/app');

    return { status: 'success', duration, netAmount: netAmount.toString(), tx: forwardTx };

  } catch (error: unknown) {
    console.error("Payment Action Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { status: 'error', message: errorMessage };
  }
}

export async function getTransactionsByAddress(address: string) {
  noStore();
  const { data, error } = await supabase
    .from('transactions')
    .select('*, gigs(title)') // Join with gigs to get title
    .or(`client_address.eq.${address},freelancer_address.eq.${address}`)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
  return data;
}

export async function getWalletStats(address: string) {
  noStore();
  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('freelancer_address', address) // Only earnings (money received)
    .eq('status', 'success');

  if (error) {
    console.error("Error fetching stats:", error);
    return { totalEarnings: 0 };
  }

  const totalEarnings = data.reduce((acc, tx) => acc + Number(tx.amount), 0);
  
  return {
    totalEarnings
  };
}
