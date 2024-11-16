create view base as 
select * --item_id, cast(cost as float) /100 as cost, u2.user_name, cast(cost as float) /100 * item_share / sum(item_share) over (partition by  item_id)  as "user_share"
from receipts r
inner join users upb on r.paid_by = upb.user_id
inner join items i using(rcpt_id)
left join item_shares sh using(item_id)
left join users ush on sh.item_share_of  = ush.user_id
