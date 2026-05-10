import sys
import os

def fix_json(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # If there are merge markers, try to extract the first valid JSON block
    if "<<<<<<<" in content:
        # Split by markers and take the first block that looks like JSON
        parts = content.split("<<<<<<<")[1:] # Skip preamble
        for part in parts:
            if "=======" in part:
                json_part = part.split("=======")[0].split("\n", 1)[1]
                try:
                    # Validate it's JSON
                    import json
                    json.loads(json_part)
                    with open(filepath, 'w') as f:
                        f.write(json_part)
                    print(f"Fixed {filepath}")
                    return
                except:
                    continue
        
        # Fallback: remove all lines starting with markers
        lines = content.splitlines()
        clean_lines = [l for l in lines if not l.startswith(("<<<<<<<", "=======", ">>>>>>>"))]
        clean_content = "\n".join(clean_lines)
        # Still might have multiple JSONs. Take the first one.
        start = clean_content.find('{')
        end = clean_content.rfind('}')
        if start != -1 and end != -1:
            clean_content = clean_content[start:end+1]
            with open(filepath, 'w') as f:
                f.write(clean_content)
            print(f"Fixed {filepath} via fallback")

fix_json("public/data/tactical_data.json")
fix_json("public/data/match_telemetry.json")
