"use server";

import { supabase } from "@/lib/supabase";
import { unstable_noStore as noStore } from 'next/cache';

export interface Gig {
  id: string;
  title: string;
  description: string;
  price: number;
  freelancerAddress: string;
  status: "open" | "paid" | "completed";
  createdAt: number;
}

export async function createGig(data: {
  title: string;
  description: string;
  price: number;
  freelancerAddress: string;
}) {
  const { data: gig, error } = await supabase
    .from("gigs")
    .insert([
      {
        title: data.title,
        description: data.description,
        price: data.price,
        freelancer_wallet: data.freelancerAddress,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating gig:", error);
    throw new Error("Failed to create gig");
  }

  return {
    id: gig.id,
    title: gig.title,
    description: gig.description,
    price: gig.price,
    freelancerAddress: gig.freelancer_wallet,
    status: gig.status,
    createdAt: new Date(gig.created_at).getTime(),
  } as Gig;
}

export async function getGig(id: string) {
  const { data: gig, error } = await supabase
    .from("gigs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !gig) {
    return null;
  }

  return {
    id: gig.id,
    title: gig.title,
    description: gig.description,
    price: gig.price,
    freelancerAddress: gig.freelancer_wallet,
    status: gig.status,
    createdAt: new Date(gig.created_at).getTime(),
  } as Gig;
}

export async function getGigsByAddress(address: string) {
  noStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let gigs: any[] | null = null;
  try {
    const { data, error } = await supabase
      .from("gigs")
      .select("*")
      .eq("freelancer_wallet", address)
      .order("created_at", { ascending: false });

    if (error) {
      throw error; // Re-throw the error to be caught by the catch block
    }
    gigs = data;
  } catch (error: unknown) {
    console.error("Error fetching gigs:", error);
    return [];
  }

  if (!gigs) {
    return [];
  }

  return gigs.map((gig) => ({
    id: gig.id,
    title: gig.title,
    description: gig.description,
    price: gig.price,
    freelancerAddress: gig.freelancer_wallet,
    status: gig.status,
    createdAt: new Date(gig.created_at).getTime(),
  })) as Gig[];
}

export async function updateGig(id: string, data: Partial<Omit<Gig, "id" | "createdAt" | "status" | "freelancerAddress">>) {
  const { data: gig, error } = await supabase
    .from("gigs")
    .update({
      title: data.title,
      description: data.description,
      price: data.price,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating gig:", error);
    throw new Error("Failed to update gig");
  }

  return {
    id: gig.id,
    title: gig.title,
    description: gig.description,
    price: gig.price,
    freelancerAddress: gig.freelancer_wallet,
    status: gig.status,
    createdAt: new Date(gig.created_at).getTime(),
  } as Gig;
}

export async function deleteGig(id: string) {
  const { error } = await supabase
    .from("gigs")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting gig:", error);
    throw new Error("Failed to delete gig");
  }

  return true;
}
