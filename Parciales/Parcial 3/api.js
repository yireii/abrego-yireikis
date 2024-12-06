class PokeAPI {
    constructor() {
        this.baseURL = 'https://pokeapi.co/api/v2';
    }
    async fetchFromAPI(endpoint) {
        const response = await fetch(`${this.baseURL}/${endpoint}`);
        if (!response.ok) throw new Error('No se pudo obtener la información de la API');
        return await response.json();
    }

    async getPokemon(name) {
        try {
            const data = await this.fetchFromAPI(`pokemon/${name.toLowerCase()}`);
            return {
                name: data.name,
                id: data.id,
                sprites: {
                    front: data.sprites.front_default,
                    back: data.sprites.back_default
                },
                weight: data.weight / 10,
                height: data.height / 10,
                abilities: data.abilities.map(ability => ({
                    name: ability.ability.name,
                    isHidden: ability.is_hidden
                }))
            };
        } catch (error) {
            throw new Error('Pokemon no encontrado');
        }
    }
    async getAbility(abilityName) {
        try {
            const data = await this.fetchFromAPI(`ability/${abilityName.toLowerCase()}`);
            return {
                name: data.name,
                pokemon: data.pokemon.map(p => ({
                    name: p.pokemon.name,
                    isHidden: p.is_hidden
                }))
            };
        } catch (error) {
            throw new Error('Habilidad no encontrada');
        }
    }
    async getEvolutionChain(pokemonId) {
        try {
            const speciesData = await this.fetchFromAPI(`pokemon-species/${pokemonId}`);
            const evolutionData = await this.fetchFromAPI(speciesData.evolution_chain.url.replace(this.baseURL + '/', ''));

            const evolutions = [];
            evolutions.push(evolutionData.chain.species.name);

            const processEvolutionsTo = (evolvesTo) => {
                for (const evolution of evolvesTo) {
                    evolutions.push(evolution.species.name);
                    if (evolution.evolves_to.length > 0) {
                        processEvolutionsTo(evolution.evolves_to);
                    }
                }
            };

            if (evolutionData.chain.evolves_to.length > 0) {
                processEvolutionsTo(evolutionData.chain.evolves_to);
            }

            return evolutions;
        } catch (error) {
            console.error('Error al obtener la cadena de evolución:', error);
            return [];
        }
    }
}

const pokeAPI = new PokeAPI();
