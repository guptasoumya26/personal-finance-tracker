ALTER TABLE public.income ADD COLUMN IF NOT EXISTS display_order integer;

CREATE OR REPLACE FUNCTION public.reorder_income(owner_id uuid, target_month text, ordered_ids uuid[])
RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  UPDATE public.income AS income
  SET display_order = sorted.position::integer
  FROM unnest(ordered_ids) WITH ORDINALITY AS sorted(id, position)
  WHERE income.user_id = owner_id AND income.month = target_month AND income.id = sorted.id;
$$;

REVOKE ALL ON FUNCTION public.reorder_income(uuid, text, uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_income(uuid, text, uuid[]) TO service_role;
