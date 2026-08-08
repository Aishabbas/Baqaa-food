// Supabase has been disabled to run 100% locally.
export const supabase = {
  from: () => {
    const chain: any = {
      select: () => chain,
      upsert: () => chain,
      delete: () => chain,
      eq: () => chain,
      neq: () => chain,
      order: () => chain,
      single: () => chain,
      then: (resolve: any) => {
        // Resolve with empty array/null data to prevent app crashes
        resolve({ data: [], error: null });
      }
    };
    return chain;
  },
  channel: () => {
    const channelChain: any = {
      on: () => channelChain,
      subscribe: () => {}
    };
    return channelChain;
  },
  removeChannel: () => {}
} as any;

