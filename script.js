const cards_body = document.querySelector('#cards');
const view_more = document.querySelector('#view_more');
const spinner = document.querySelector('.spinner');
const MAX_POKEMONS = 898;
let current_pokemon_id;
let offset = 0;

const options = {
    method: 'GET',
    mode: 'cors',
    cache: 'default'
};

const get_stats = (response) => {
    return (`${response.stats.map(element => `<tr><th>${element.stat.name.toUpperCase()}</th>
        <td>${element.base_stat}</td></tr>`)}`).replace(/,/g, "");
};

const get_abilities = (response) => {
    return `${response.abilities.map(element => element.ability.name).join(", ")}`;
};

const get_types = (response) => {
    return (`${response.types.map(element => `<h3 class="card__type card__type__${element.type.name}">
        ${element.type.name.toUpperCase()}</h3>`)}`).replace(/,/g, "");
};

async function get_chain(response) {
    return await (fetch(response.species.url, options)
        .then(data => data.json()
            .then(data2 => fetch(data2.evolution_chain.url, options)
                .then(data => data.json()
                    .then(data3 => {
                        return get_evolution(data3, data2.name)
                    })
                )
            )
        )
    )
}

const get_evolution = (response, name) => {
    const evolution = [];
    if (response.chain.evolves_to.length !== 0) {
        response.chain.evolves_to.forEach(
            first_level => {
                if (response.chain.species.name === name) {
                    evolution.push(first_level.species.name)
                };
                first_level.evolves_to.forEach(
                    second_level => {
                        if (first_level.species.name === name) {
                            evolution.push(second_level.species.name)
                        };
                    }
                );
            }
        )
    }
    return evolution.length == 0 ? "NONE" : `${evolution.join(", ")}`;
};

const generate_navigation = (body) => {
    switch (current_pokemon_id) {
        case 1:
            cards_body.innerHTML = `${body}<input type="button"
            value="Next pokemon" onclick="directed_request(current_pokemon_id + 1)">`;
            break;
        case MAX_POKEMONS:
            cards_body.innerHTML = `<input type="button"
            value="Previous pokemon" onclick="directed_request(current_pokemon_id - 1)">${body}`;
            break;
        default:
            cards_body.innerHTML = `<input type="button"
            value="Previous pokemon" onclick="directed_request(current_pokemon_id - 1)">${body}
            <input type="button" value="Next pokemon"
            onclick="directed_request(current_pokemon_id + 1)">`;
    }
}

const create_html = (response, evolution, type) => {
    const sprite = response.sprites.other;
    const new_body = `<figure class="card card--${response.types[0].type.name}">
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
                                    ${evolution.toUpperCase()}
                                </h4>
                            </div>
                            <table class="card__stats">
                                <tbody>${get_stats(response)}</tbody>
                            </table>
                        </figcaption>
                    </figure>`;
    if (type === 'list')
        cards_body.innerHTML += new_body;
    else {
        generate_navigation(new_body);
    }
    spinner.hidden = true;
};

async function populate(response, type) {
    const response_evolution = await get_chain(response);
    create_html(response, response_evolution, type);
}

function load_content() {
    fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&amp;limit=3`, options)
        .then(response => {
            response.json()
            .then(data => data.results.forEach(data => fetch(data.url, options)
                .then(response => {
                    response.json().then(data => populate(data, 'list'))
                })
            ))
        });
    offset += 3;
    if (view_more.innerHTML == "")
        view_more.innerHTML = `<input type="button" value="View More" onclick="load_content()">`;
}

function directed_request(field) {
    spinner.hidden = false;
    offset = 0;
    view_more.innerHTML = "";
    cards_body.innerHTML = "";
    fetch(`https://pokeapi.co/api/v2/pokemon/${field}`, options)
        .then(response => {
            if (response.status == 404) {
                spinner.hidden = true;
                cards_body.innerHTML = "<p>Pokemon Not Found!</p>";
            }
            else {
                response.json()
                    .then(data => {
                        current_pokemon_id = data.id;
                        populate(data, 'directed');
                    })
            }
        });
}

function search_pokemon() {
    const search = document.querySelector("#input_data");
    directed_request(search.value.toLowerCase());
    search.value = '';
}

function random_pokemon() {
    const random_number = Math.floor(Math.random() * MAX_POKEMONS) + 1;
    directed_request(random_number);
}