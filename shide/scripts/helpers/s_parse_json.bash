# parse json into global variables
# e.g. s_parse_json prefix <<<'{"x": 1, "y": {"z": 2}}'
# creates prefix_x and prefix_y_z
# doesn't create prefix_y
#
# also arrays:
# e.g. s_parse_json prefix <<<'{"x": ["y", "z"]}'
# creates prefix_x_length prefix_x_0 and prefix_x_1

function s_parse_json_key_to_var () {
  printf "%s" "$1" | sed 's/[^A-Za-z0-9_]\{1,\}/_/g'
}

function s_parse_json () {
  local prefix="${1:-body}"
  local json="${2}"
  if [[ $json = '' ]]; then
    json=$(cat)
  fi

  if [[ $json = '' ]]; then
    printf '%s\n' 's_parse_json expected json as either stdin or a second argument' >&2
    return 13
  fi
  local keys=()
  while IFS= read -r key; do
    keys+=("$key")
  done < <(jq 'keys[]' -r <<<"$json")
  local key
  local is_array=false
  if [[ "$(jq 'type' -r <<<"$json")" == "array" ]]; then
    is_array=true
  fi
  for key in "${keys[@]}"; do
    local quoted
    quoted=$(printf '"%s"' "$key")
    if [[ "$is_array" == "true" ]]; then
      quoted="[$key]"
    fi
    local selfquery
    selfquery=".${quoted}"
    local type
    type="$(jq "$selfquery | type" -r <<<"$json")"
    if [[ "$type" == "string" ]] || [[ "$type" == "number" ]] || [[ $type == 'null' ]]; then
      local var
      var="${prefix}_${key}"
      var="$(s_parse_json_key_to_var "$var")"
      printf -v "$var" '%s' "$(jq "$selfquery" -r <<<"$json")"
    fi
    if [[ $type == 'object' ]]; then
      local subkey
      subkey="$(printf '%s_%s' "$prefix" "$key")"
      subkey="$(s_parse_json_key_to_var "$subkey")"
      s_parse_json "$subkey" <<<"$(jq "$selfquery" <<<"$json")"
    fi
    if [[ $type == 'array' ]]; then
      local subkey
      subkey="$(printf '%s_%s' "$prefix" "$key")"
      local length
      length="$(jq "$selfquery | length" <<<"$json")"
      local lenkey
      lenkey="${prefix}_${key}_length"
      printf -v "$lenkey" '%s' "$length"
      s_parse_json "$subkey" <<<"$(jq "$selfquery" <<<"$json")"
    fi
  done
}

