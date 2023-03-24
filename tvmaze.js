"use strict";

const $showsList = $('#shows-list');
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");



/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
 const missingImg = "https://tinyurl.com/tv-missing"

async function searchShows(query) {
  // ADD: Remove placeholder & 
  // make request to TVMaze search shows API.
  const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${query}`)
  let shows =[];
  for (let item of res.data){
    shows.push({
      id: item.show.id,
      name: item.show.name,
      summary: item.show.summary,
      episodeURL: `${item.show.url}/episodes`,
      image: item.show.image ? item.show.image.original : missingImg
    })
  }
  return shows; 
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $item = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="card" id="${show.id}">
           <img src="${show.image}" class="card-img-top">
           <div class="card-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="get-episodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($item);  
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

$searchForm.on("submit", async function (e) {
  e.preventDefault();
  let query = $('#search-query').val();
  if(!query) return;
  let shows = await searchShows(query);
  populateShows(shows);
  for(let show of shows){
    $(`#${show.id}`).on('click', async function displayEpisodes(e){
      const id = show.id;
      const episodes = await getEpisodes(id);
  
      $('#episodes-area').show();
  
      populateEpisodes(episodes);
    })
    
  }
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
// async function getEpisodesOfShow(id) { }
async function getEpisodes(id){
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  const episodeList = res.data.map((episode)=>{
    return{id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }});
  return episodeList;
}

function populateEpisodes(episodeList){
  const $episodesList = $("#episodes-list");
  $episodesList.empty();  
  for (let episode of episodeList) {
    let $item = $(
      `<li>
         ${episode.name}
         (season ${episode.season}, episode ${episode.number})
       </li>
      `);

    $episodesList.append($item);
  }
  $("#episodes-area").show();
}


