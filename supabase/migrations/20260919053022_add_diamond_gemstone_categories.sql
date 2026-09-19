-- Step 1: extend product_category enum
alter type public.product_category add value if not exists 'diamond';
alter type public.product_category add value if not exists 'gemstone';
