import requests
import json
import time
from typing import Dict, List, Any, Optional

class MoveFetcher:
    def __init__(self):
        self.base_url = "https://pokeapi.co/api/v2"
        self.session = requests.Session()
        self.moves_data = {}
        
    def get_all_moves(self) -> List[Dict]:
        """Fetch list of all moves from PokeAPI"""
        print("Fetching list of all moves...")
        moves = []
        url = f"{self.base_url}/move"
        
        while url:
            response = self.session.get(url)
            if response.status_code == 200:
                data = response.json()
                moves.extend(data['results'])
                url = data['next']
            else:
                print(f"Error fetching moves list: {response.status_code}")
                break
                
        print(f"Found {len(moves)} total moves")
        return moves
    
    def get_move_details(self, move_url: str) -> Optional[Dict]:
        """Fetch detailed move data from PokeAPI"""
        try:
            response = self.session.get(move_url)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error fetching move details: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error fetching move: {e}")
            return None
    
    def extract_machines(self, machines: List[Dict]) -> List[str]:
        """Extract machine names for Black/White 2"""
        bw2_machines = []
        for machine_data in machines:
            version_group = machine_data.get('version_group', {}).get('name', '')
            if version_group == 'black-2-white-2':
                # Extract machine name from URL
                machine_url = machine_data.get('machine', {}).get('url', '')
                if machine_url:
                    machine_id = machine_url.split('/')[-2]
                    # Convert to TM/HM format
                    if machine_id.isdigit():
                        machine_num = int(machine_id)
                        if machine_num <= 95:  # TMs
                            bw2_machines.append(f"TM{machine_num:02d}")
                        else:  # HMs
                            hm_num = machine_num - 95
                            bw2_machines.append(f"HM{hm_num:02d}")
        return bw2_machines
    
    def extract_learned_by_pokemon(self, learned_by: List[Dict]) -> List[Dict]:
        """Extract Pokemon that can learn this move"""
        pokemon_list = []
        for pokemon in learned_by:
            pokemon_url = pokemon.get('url', '')
            if pokemon_url:
                pokemon_id = pokemon_url.split('/')[-2]
                pokemon_name = pokemon.get('name', '')
                pokemon_list.append({
                    'id': int(pokemon_id),
                    'name': pokemon_name
                })
        return pokemon_list
    
    def extract_stat_changes(self, stat_changes: List[Dict]) -> List[Dict]:
        """Extract stat change information"""
        changes = []
        for change in stat_changes:
            stat_name = change.get('stat', {}).get('name', '')
            change_amount = change.get('change', 0)
            changes.append({
                'stat': stat_name,
                'change': change_amount
            })
        return changes
    
    def extract_meta_data(self, meta: Dict) -> Dict:
        """Extract meta information about the move"""
        return {
            'healing': meta.get('healing', 0),
            'drain': meta.get('drain', 0),
            'flinch_chance': meta.get('flinch_chance', 0),
            'crit_rate': meta.get('crit_rate', 0),
            'ailment': meta.get('ailment', {}).get('name', 'none'),
            'ailment_chance': meta.get('ailment_chance', 0)
        }
    
    def extract_effect(self, effect_entries: List[Dict]) -> str:
        """Extract English effect description"""
        for entry in effect_entries:
            language = entry.get('language', {}).get('name', '')
            if language == 'en':
                return entry.get('effect', '')
        return ''
    
    def process_move(self, move_data: Dict) -> Dict:
        """Process raw move data into our desired format"""
        move_id = move_data.get('id')
        
        # Extract basic information
        processed_move = {
            'id': move_id,
            'name': move_data.get('name', ''),
            'type': move_data.get('type', {}).get('name', ''),
            'category': move_data.get('damage_class', {}).get('name', ''),
            'power': move_data.get('power'),
            'accuracy': move_data.get('accuracy'),
            'pp': move_data.get('pp', 0),
            'priority': move_data.get('priority', 0),
            'target': move_data.get('target', {}).get('name', ''),
            'effect': self.extract_effect(move_data.get('effect_entries', [])),
            'effect_chance': move_data.get('effect_chance'),
            'stat_changes': self.extract_stat_changes(move_data.get('stat_changes', [])),
            'meta': self.extract_meta_data(move_data.get('meta', {})),
            'machines': self.extract_machines(move_data.get('machines', [])),
            'learned_by_pokemon': self.extract_learned_by_pokemon(move_data.get('learned_by_pokemon', [])),
            'generation': move_data.get('generation', {}).get('name', '')
        }
        
        return processed_move
    
    def fetch_all_moves(self):
        """Main method to fetch and process all moves"""
        print("Starting move data extraction...")
        
        # Get list of all moves
        moves_list = self.get_all_moves()
        
        # Process each move
        for i, move in enumerate(moves_list):
            print(f"Processing move {i+1}/{len(moves_list)}: {move['name']}")
            
            # Fetch detailed move data
            move_details = self.get_move_details(move['url'])
            if move_details:
                processed_move = self.process_move(move_details)
                self.moves_data[str(processed_move['id'])] = processed_move
            
            # Rate limiting - be respectful to PokeAPI
            time.sleep(0.1)
        
        print(f"Successfully processed {len(self.moves_data)} moves")
    
    def save_moves_data(self, filename: str = 'moves.json'):
        """Save processed moves data to JSON file"""
        output_path = f"bb2rdex/public/data/{filename}"
        
        # Create data directory if it doesn't exist
        import os
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.moves_data, f, indent=2, ensure_ascii=False)
        
        print(f"Moves data saved to {output_path}")
        print(f"Total moves: {len(self.moves_data)}")

def main():
    """Main execution function"""
    fetcher = MoveFetcher()
    
    try:
        # Fetch all moves
        fetcher.fetch_all_moves()
        
        # Save to JSON file
        fetcher.save_moves_data()
        
        print("Move data extraction completed successfully!")
        
    except Exception as e:
        print(f"Error during move extraction: {e}")

if __name__ == "__main__":
    main() 