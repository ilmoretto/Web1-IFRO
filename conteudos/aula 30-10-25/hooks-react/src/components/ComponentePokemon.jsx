import { useState, useEffect } from 'react';

export default function ComponentePokemon() {
    const [id, setId] = useState(1);
    const [pokemao, setPokemao] = useState(null);
    // useEffect(a,b)
    useEffect(() => {
        if (id) {
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
                .then(response => response.json())
                .then(data => setPokemao(data))
        }
    }, [id])

    return (
        <div>
            <h2>Consumindo Pokemao</h2>
            <label>Id do pokemao</label>
            <input type="number" value={id} onChange={e => setId(e.target.value)} min="1" />
            {pokemao ? (
                <img src={pokemao.sprites.front_default} style={{ maxWidth: "500px" }}></img>

            ) : (
                <p>carregando pokemao...</p>
            )}
        </div>
    );

};