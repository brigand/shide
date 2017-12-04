json='{"path": "foo.js", "x": "y", "nested": { "nsprop": "7"}, "with_space": "val with space", "null_key": null, "array": ["array_item", "array_item_2"], "with/slash": 1}'

source scripts/helpers/s_parse_json.bash

s_parse_json stuff <<<"$json"
#echo "$json" | s_parse_json stuff
for k in path x nested nested_nsprop with_space array_length array_0 array_1 with_slash; do
  full="stuff_$k"
  printf '%s: %s\n' "$full" "${!full}"
done

