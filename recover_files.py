import json
import os
import re

transcript_path = r"C:\Users\USER\.gemini\antigravity-ide\brain\643f63b4-8003-4655-89f7-cbfcb2a21e70\.system_generated\logs\transcript_full.jsonl"
file_versions = {}

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            step = json.loads(line)
            if step.get('type') == 'PLANNER_RESPONSE' and 'tool_calls' in step:
                for tc in step['tool_calls']:
                    args = tc.get('args', {})
                    if tc['name'] == 'write_to_file':
                        target = args.get('TargetFile', '').replace('/', '\\')
                        if target.endswith('.py') and ('CAFEMONITOR' in target or 'modules' in target):
                            # normalize path back to CAFEMONITOR
                            target = target.replace('\\modules\\', '\\CAFEMONITOR\\app\\')
                            file_versions[target] = args.get('CodeContent', '')
        except Exception as e:
            pass

for path, content in file_versions.items():
    if 'Final-Project' in path:
        rel_path = path[path.find('Final-Project')+14:]
        abs_path = os.path.join(r"C:\Users\USER\Desktop\Final-Project", rel_path)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        # only write if empty or not exists
        if not os.path.exists(abs_path) or os.path.getsize(abs_path) == 0:
            with open(abs_path, 'w', encoding='utf-8') as out:
                out.write(content)
                print(f"Recovered {abs_path}")
