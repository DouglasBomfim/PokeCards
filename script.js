var table_body = document.querySelector('#cards');
var current_pokemon_id;

var options = { method: 'GET',
               mode: 'cors',
               cache: 'default' 
            };

const get_stats = (response) => {
    return (`${response.stats.map(element => `<tr><th>${element.stat.name.toUpperCase()}</th>
        <td>${element.base_stat}</td></tr>`)}`).replace(/,/g,"");
};

const get_abilities = (response) => {
    return `${response.abilities.map(element => element.ability.name).join(", ")}`;
};

const get_types = (response) => {
    return (`${response.types.map(element => `<h3 class="card__type card__type__${element.type.name}">
        ${element.type.name.toUpperCase()}</h3>`)}`).replace(/,/g,"");
};

async function get_chain(response) {
    let response_chain;
    await (fetch(response.species.url, options)
                .then(data => data.json()
                    .then(data2 => fetch(data2.evolution_chain.url, options)
                        .then(data => data.json()
                            .then(data3 => { 
                                response_chain = get_evolution(data3, data2.name)
                            })
                        )
                    )
                ))
    return response_chain;
} 

const get_evolution = (response, name) => {
    let evolution = [];
    if(response.chain.evolves_to.length !== 0){
        response.chain.evolves_to.forEach(
          element1 => { if(response.chain.species.name === name) {
                            evolution.push(element1.species.name)};
                        element1.evolves_to.forEach(
                            element2 => { if(element1.species.name === name) {
                                            evolution.push(element2.species.name)};
                            }
                        );
                    }
        )
    }
    if(evolution.length == 0)
        return "NONE";
    else
        return `${evolution.join(", ")}`;
};

async function populate(response, type) {
    const sprite = response.sprites.other;
    let response_evolution = await get_chain(response);
    let new_body = `<figure class="card card--${response.types[0].type.name}">
                        <div class="card__image-container">
                            <img src="${sprite["official-artwork"].front_default != null ? 
                                sprite["official-artwork"].front_default : 
                                sprite.dream_world.front_default}" 
                                alt="${response.name.toUpperCase()}" class="card__image">
                        </div>
                        <figcaption class="card__caption">
                            <h1 class="card__name">${response.name.toUpperCase()} - Nº${response.id}</h1>
                            <div class="card__types">
                                ${get_types(response)}
                            </div>
                            <div class="card__box">
                                <h4 class="card__block">
                                    <span class="card__label">Abilities</span>
                                    ${get_abilities(response).toUpperCase()}
                                </h4>
                                <h4 class="card__block">
                                   <span class="card__label">Evolve To</span>
                                    ${response_evolution.toUpperCase()}
                                </h4>
                            </div>
                            <table class="card__stats">
                                <tbody>${get_stats(response)}</tbody>
                            </table>
                        </figcaption>
                    </figure>`;
    if(type === 'list')
        table_body.innerHTML += new_body;
    else {
        if(current_pokemon_id == 1) {
            table_body.innerHTML += `${new_body}<input type="button" id="random_button"
             value="Next pokemon" onclick="directed_request(current_pokemon_id + 1)">`;
        }
        else{
            if(current_pokemon_id == 898) {
                table_body.innerHTML += `<input type="button" id="random_button"
                 value="Previous pokemon" onclick="directed_request(current_pokemon_id - 1)">${new_body}`
            }
            else {
                table_body.innerHTML += `<input type="button" id="random_button"
                 value="Previous pokemon" onclick="directed_request(current_pokemon_id - 1)">${new_body}
                 <input type="button" id="random_button" value="Next pokemon"
                  onclick="directed_request(current_pokemon_id + 1)">`;
            }
        }
    }
}

function load_content() {
    fetch('https://pokeapi.co/api/v2/pokemon/?limit=30', options)
    .then(response => {response.json()
        .then(data => data.results.forEach(data => fetch(data.url, options)
            .then(response => {
                response.json().then(data => populate(data, 'list'))
            })
        ))
    });
}

function directed_request(field) {
    table_body.innerHTML = "";
    fetch(`https://pokeapi.co/api/v2/pokemon/${field}`, options)
        .then(response => { if(response.status == 404){
            table_body.innerHTML = "<p>Pokemon Not Found!</p>";
        }else {response.json()
            .then(data => {current_pokemon_id = data.id;
                           populate(data, 'directed');})
        }});
}

function search_pokemon() {
    let search = document.querySelector("#input_data");
    directed_request(search.value.toLowerCase());
    search.value = '';
}

function random_pokemon() {
    let random_number = Math.floor(Math.random() * 898) + 1;
    directed_request(random_number);
}