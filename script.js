var table_body = document.querySelector('#cards');
var current_pokemon_id;

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

const populate = (response, type) => {
    const sprite = response.sprites.other;
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
                            <table class="card__stats">
                                <tbody>${get_stats(response)}</tbody>
                                <div class="card__abilities">
                                    <h4 class="card__ability">
                                        <span class="card__label">Abilities</span>
                                        ${get_abilities(response).toUpperCase()}
                                    </h4>
                                </div>
                            </table>
                        </figcaption>
                    </figure>`;
    if(type === 'list')
        table_body.innerHTML += new_body;
    else {
        if(current_pokemon_id == 1) {
            table_body.innerHTML += `${new_body}<input type="button" id="card_button"
             value="Next pokemon" onclick="directed_request(current_pokemon_id + 1)">`;
        }
        else{
            if(current_pokemon_id == 898) {
                table_body.innerHTML += `<input type="button" id="card_button"
                 value="Previous pokemon" onclick="directed_request(current_pokemon_id - 1)">${new_body}`
            }
            else {
                table_body.innerHTML += `<input type="button" id="card_button"
                 value="Previous pokemon" onclick="directed_request(current_pokemon_id - 1)">${new_body}
                 <input type="button" id="card_button" value="Next pokemon"
                  onclick="directed_request(current_pokemon_id + 1)">`;
            }
        }
    }
};

var options = { method: 'GET',
               mode: 'cors',
               cache: 'default' 
            };

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
        .then(response => {response.json()
            .then(data => {current_pokemon_id = data.id;
                           populate(data, 'directed');})
    });
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