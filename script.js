const url_api_parties = 'https://servico-dolabella-festa.onrender.com/api/parties'
const url_api_services = 'https://servico-dolabella-festa.onrender.com/api/services'
const parties_container = document.getElementById('parties_container');
const party_form = document.getElementById('party_form');
const create_party_button = document.getElementById('create_party_button');
let parties = [];
let servicesdata = [];
create_party_button.onclick = () =>{
    if(parties_container.style.display != 'none'){
        parties_container.style.display = 'none';
        party_form.style.display = 'flex';
    }else{
        parties_container.style.display = 'flex';
        party_form.style.display = 'none';
    }
}
async function Get_parties() {
    const response = await fetch(url_api_parties);
    const data = await response.json();
    return data
}

async function get_services() {
    const services_form = document.getElementById('services_form');
    const response = await fetch(url_api_services);
    const data = await response.json();
    servicesdata = data;
    console.log(servicesdata);
    
    data.forEach(service =>{
        services_form.innerHTML += `
            <div class="col-md-4 col-sm-12">
                <div class="card mb-5 shadow-sm p-2">
                    <div class="img_party" style=" background-image: url('${service.image}'); background-size: cover;"></div>
                    <div class="card-body">
                        <div class="card-title">
                            <h2>${service.name}</h2>
                        </div>
                        <div class="card-text">
                            <hr>
                            <p>
                                Preço: R$${service.price}
                            </p>
                        </div>
                        <input type="checkbox" value="${service._id}" class="form-check-input me-2"> <span>Adicionar</span>
                    </div>      
                </div>
            </div>
        `
    })
    
}
party_form.onsubmit = async (e) => {
    e.preventDefault();
    let party_object = {
        "title": document.getElementById('title_party_form').value,
        "author": document.getElementById('author_party_form').value,
        "description": document.getElementById('description_party_form').value,
        "budget": parseFloat(document.getElementById('budget_party_form').value),
        "image":document.getElementById('image_party_form').value,
        "services": []
    }
    let service_price = 0;
     const service_checkboxes = document.querySelectorAll('#services_form input[type="checkbox"]');
     service_checkboxes.forEach(checkbox => {
         if (checkbox.checked) {
             const serviceId = checkbox.value;
             const selectedService = servicesdata.find(service => service._id === serviceId);
 
             if (selectedService) {
                 party_object.services.push(selectedService);
                 service_price += selectedService.price
             }
         }
     });
     if(service_price <= party_object.budget){
        const response = await fetch(url_api_parties,{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(party_object)
        })
        const data = await response.json();
        console.log(data);
        start_parties();
        party_form.reset();
        parties_container.style.display = 'flex';
        party_form.style.display = 'none';
     }else{
        alert('orçamento muito baixo!')
     }
    
    
}

get_services();
async function start_parties() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
    const parties = await Get_parties();  // Espera a função Get_parties terminar
    if (parties.length > 0) {
        parties_container.innerHTML = ''; 
        parties.forEach(party => {
            let party_servicos = '';
            if(party.services.length == 0){party_servicos = ' Nenhum'}
            for (let i = 0; i < party.services.length; i++) {
                party_servicos += ` "${party.services[i].name}"`; 
            }
            parties_container.innerHTML += `
            <div class="col-lg-4 col-md-6 col-sm-12">
                <div class="card mb-5 shadow-sm p-2">
                    <div class="img_party" style=" background-image: url('${party.image}');"></div>
                    <div class="card-body">
                        <div class="card-title">
                            <h2>${party.title}</h2>
                        </div>
                        <div class="card-text">
                            <hr>
                            <p>
                                Orçamento: R$${party.budget}
                            </p>
                        </div>
                        <div class="btn btn-outline-primary rounded " id="${party._id}">Detalhes</div>
                    </div>
                </div>
            </div>
            `;
           
        });
        parties_container.addEventListener('click', (e) => {
            if (e.target && e.target.innerHTML === 'Detalhes') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                })
                const party_details = document.getElementById('party_details')
                const selectedParty = parties.find(party => e.target.id === party._id);
                let preco = 0;
                for(let i = 0; i < selectedParty.services.length; i++){
                    preco += selectedParty.services[i].price
                }
                party_details.style.display = 'block'
                parties_container.style.display = 'none'
                party_details.innerHTML = `
                    <div class="col-lg-4 col-md-6 col-sm-12 mx-auto">
                    <div class="card mb-5 shadow-sm p-2">
                        <div class="card-body">
                            <div class="card-title text-center">
                                <h2>${selectedParty.title}</h2>
                            </div>
                            <div class="card-text text-center mb-3">
                                <hr>
                                <p>
                                    Autor: ${selectedParty.author}
                                </p>
                                <hr>
                                <p>
                                    Orçamento: R$${selectedParty.budget}
                                </p>
                                <hr>
                                <p>
                                    Preço: R$${preco}
                                </p>
                                <hr>
                                <p class=" px-3">
                                   Descrição: ${selectedParty.description}
                                </p>
                                <hr>
                            </div>
                            <div class="d-flex justify-content-center">
                                <div class="btn btn-outline-primary rounded me-2" >Voltar</div>
                                <div class="btn btn-outline-danger rounded" >Deletar</div>
                            </div>
                            
                        </div>
                    </div>
                </div>
                <h2 class="text-center my-5">Serviços:</h2>
                 <div class="row col-12 g-3 justify-content-center" id="party_details_service"></div>
               
                `
                if(selectedParty.services.length > 0){
                    selectedParty.services.forEach(service =>{
                        document.getElementById('party_details_service').innerHTML += `
                            <div class="col-lg-3 col-sm-5 mx-1">
                                <div class="card mb-5 shadow-sm p-2">
                                    <div class="img_party" style=" background-image: url('${service.image}'); background-size: cover;"></div>
                                    <div class="card-body">
                                        <div class="card-title">
                                            <h4>${service.name}</h4>
                                        </div>
                                        <div class="card-text">
                                            <hr>
                                            <p>
                                                Preço: R$${service.price}
                                            </p>
                                        </div>
                                    </div>      
                                </div>
                            </div>
                        `
                    })
                }else{
                    document.getElementById('party_details_service').innerHTML = '<h2 class="text-center">Sem serviços...</h2>'
                }
                party_details.onclick = (e) =>{
                    switch (e.target.innerHTML){
                        case "Deletar":
                            Delete_party(selectedParty._id)
                            break;
                        case "Voltar":
                            party_details.style.display = 'none'
                            parties_container.style.display = 'flex'
                            window.scrollTo({
                                top: 0,
                                behavior: 'smooth'
                            })
                            break;
                    }
                }
            }
            
        });
    } else {
        parties_container.innerHTML = '<h2 class="text-center">Nenhuma festa...</h2>';
    }

}
async function Delete_party(id){
    const response = await fetch(url_api_parties+'/'+id, {
        method: "DELETE",
    })
    start_parties();
    party_details.style.display = 'none'
    parties_container.style.display = 'flex'
    const data = await response.json();
    console.log(data)
}
start_parties();

