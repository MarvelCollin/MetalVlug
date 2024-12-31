import json
import os

def generate_getter_name(path_parts):
    """Membuat nama getter dari path"""
    return "get" + "".join(part.capitalize() for part in path_parts)

def generate_getter_path(path_parts):
    """Membuat path untuk mengakses JSON"""
    return ".".join(path_parts)

def process_json_structure(data, current_path=None, getters=None):
    """Scan JSON dan bikin getter methodnya"""
    if getters is None:
        getters = []
    if current_path is None:
        current_path = []

    for key, value in data.items():
        path = current_path + [key]
        
        # Kalo ketemu PATH, berarti ini animation entry
        if isinstance(value, dict) and "PATH" in value:
            getter_name = generate_getter_name(path)
            getter_path = generate_getter_path(path)
            
            # Bikin getter methodnya
            getter = f"""
    async {getter_name}() {{
        const assets = await this.fetchAssets();
        return assets.{getter_path};
    }}"""
            getters.append(getter)
        
        # Recursive kalo masih ada nested object
        elif isinstance(value, dict):
            process_json_structure(value, path, getters)
    
    return getters

def generate_assets_class(json_file_path, output_file_path):
    """Generate assets.js class"""
    # Baca JSON file
    with open(json_file_path, 'r') as f:
        data = json.load(f)
    
    # Generate semua getter methods
    getters = process_json_structure(data)
    
    # Bikin class template dengan relative path
    class_code = """// filepath: ../js/game/assets.js
class Assets {
    static instance = null;
    static assets = null;

    constructor() {
        if (Assets.instance) {
            return Assets.instance;
        }
        Assets.instance = this;
    }

    async fetchAssets() {
        if (Assets.assets) {
            return Assets.assets;
        }
        const response = await fetch('../assets/assets.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        Assets.assets = await response.json();
        return Assets.assets;
    }
%s

}

const assetsInstance = new Assets();
export default assetsInstance;
"""
    
    # Gabungin semua getters
    final_code = class_code % "\n".join(getters)
    
    # Simpan ke file
    with open(output_file_path, 'w') as f:
        f.write(final_code)

if __name__ == "__main__":
    json_path = "../assets/assets.json"
    js_output_path = "../js/game/assets.js"
    
    generate_assets_class(json_path, js_output_path)
    print(f"Assets class telah digenerate di: {js_output_path}")
