-- Create a function to safely decrement stock
create or replace function decrement_stock(
  p_product_id uuid,
  p_size text,
  p_quantity int
)
returns void
language plpgsql
security definer
as $$
declare
  v_current_stock int;
  v_sizes jsonb;
  v_size_mode text;
begin
  -- Get current sizes JSON and size_mode
  select sizes, size_mode into v_sizes, v_size_mode
  from products
  where id = p_product_id;

  -- If size_mode is 'all', we don't track stock, so just return
  if v_size_mode = 'all' then
    return;
  end if;

  -- Get current stock for the specific size
  -- Coalesce to 0 if size doesn't exist
  v_current_stock := coalesce((v_sizes->>p_size)::int, 0);

  -- Check if we have enough stock
  if v_current_stock < p_quantity then
    raise exception 'Insufficient stock for product % size %', p_product_id, p_size;
  end if;

  -- Update the JSON with new quantity
  update products
  set sizes = jsonb_set(sizes, array[p_size], (v_current_stock - p_quantity)::text::jsonb)
  where id = p_product_id;
end;
$$;
