update metadata 
    set payload = json_insert(payload, 
    '$[#]', json_object('users & memberships', 'chart color red'),
    '$[#]', json_object('users & memberships', 'chart color red'),
    '$[#]', json_object('users & memberships', 'chart color green'),
    '$[#]', json_object('users & memberships', 'chart color green'),
    '$[#]', json_object('users & memberships', 'chart color blue'),
    '$[#]', json_object('users & memberships', 'chart color blue'),
    '$[#]', json_object('users & memberships', 'chart line is dashed'),
    '$[#]', json_object('users & memberships', 'chart is configured')
)
where name = 'statuses';
