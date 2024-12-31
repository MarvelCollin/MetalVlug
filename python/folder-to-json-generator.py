import os
import json

def scan_folder(base_path):
    animation_data = {"PLAYER": {}}

    for root, dirs, files in os.walk(base_path):
        relative_path = os.path.relpath(root, base_path)
        path_parts = relative_path.split(os.sep)

        # Cek apakah foldernya di dalam folder 'player'
        if len(path_parts) >= 2 and path_parts[0].lower() == "player":
            current_dict = animation_data["PLAYER"]
            
            # Buat struktur JSON sesuai dengan seperti folder
            for i, part in enumerate(path_parts[1:-1]):
                part = part.upper()
                if part not in current_dict:
                    current_dict[part] = {}
                current_dict = current_dict[part]

            # Cari file PNGnya
            frames = [file for file in files if file.endswith('.png')]
            if frames:
                frames.sort()
                animation_name = os.path.basename(root).upper()
                # store ke jsonnya
                path = os.path.join(relative_path, animation_name.lower() + "_").replace("\\", "/")
                current_dict[animation_name] = {
                    "PATH": path,
                    "FRAMES": len(frames),
                    "TYPE": "LOOP"
                }

    return animation_data

def save_json(data, output_file):
    """
    Simpan data ke file JSON
    """
    with open(output_file, "w") as f:
        json.dump(data, f, indent=4)

if __name__ == "__main__": 
    base_path = "../assets"  # folder yang pengen di scan
    output_file = "../assets/assets.json" # nanti disimpen dipath ini

    animation_json = scan_folder(base_path)
    save_json(animation_json, output_file)

    print(f"File JSON sudah dibuat di: {output_file}")
