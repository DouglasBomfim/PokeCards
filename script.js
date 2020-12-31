var table_body = document.querySelector('#corpo');

const get_stats = (response) => {
    let html = '<ul>';
    for(i in response.stats){
        html += `<p>${response.stats[i].stat.name.toUpperCase()}: ${response.stats[i].base_stat}</p>`
    }
    html += "</ul>";
    return html;
};

const get_abilities = (response) => {
    let html = '';
    for(i in response.abilities){
        if(i == response.abilities.length - 1)
            html += response.abilities[i].ability.name;
        else
            html += `${response.abilities[i].ability.name}, `;
    }
    return html;
};

const get_types = (response) => {
    let html = '';
    for(i in response.types){
        if(i == response.types.length - 1)
            html += response.types[i].type.name;
        else
            html += `${response.types[i].type.name}, `;
    }
    return html;
};

const populate = (response) => {
    let new_body = "";
    new_body += "<tr>";
    new_body += `<td>${response.name.toUpperCase()}</td>`;
    new_body += `<td>${(response.height)/10} m</td>`;
    new_body += `<td>${(response.weight)/10} kg</td>`;
    new_body += `<td>${get_stats(response)}</td>`
    new_body += `<td>${get_abilities(response).toUpperCase()}</td>`;
    new_body += `<td>${get_types(response).toUpperCase()}</td>`;
    new_body += `<td><img src="${response.sprites.front_default}"></td>`
    new_body += `</tr>`;
    table_body.innerHTML += new_body;
};

var options = { method: 'GET',
               mode: 'cors',
               cache: 'default' 
            };

fetch('https://pokeapi.co/api/v2/pokemon/?limit=20', options)
    .then(response => {response.json()
        .then(data => data.results.forEach(data => fetch(data.url, options)
            .then(response => {
                response.json().then(data => populate(data))
            })
        ))
    });

function search_pokemon() {
    let search = document.querySelector("#entrada");
    table_body.innerHTML = "";
    fetch(`https://pokeapi.co/api/v2/pokemon/${search.value.toLowerCase()}`, options)
        .then(response => {response.json()
            .then(data => populate(data))
    });
    search.value = '';
}