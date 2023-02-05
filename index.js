async function fetchData(searchTerm, searchBy = 's') {
  const response = await axios.get('http://www.omdbapi.com/', {
    params: {
      apikey: 'b98561b4',
      [searchBy]: searchTerm,
    },
  });
  if (response.data.Error) {
    return [];
  }

  return searchBy === 's' ? response.data.Search : response.data;
}

const autoComplete = {
  renderOption(movie) {
    const imgsrc = movie.Poster === 'N/A' ? '' : movie.Poster;
    return `
        <img src="${imgsrc}" />
        ${movie.Title}(${movie.Year})
    `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  fetchData,
};

createAutoComplete({
  ...autoComplete,
  root: document.querySelector('#left-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
  },
});

createAutoComplete({
  ...autoComplete,
  root: document.querySelector('#right-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
  },
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summaryElement, side) => {
  const movieDetails = await fetchData(movie.imdbID, 'i');

  const movieCard = movieTemplate(movieDetails);
  summaryElement.innerHTML = movieCard;

  if (side === 'left') {
    leftMovie = movieDetails;
  } else {
    rightMovie = movieDetails;
  }

  if (leftMovie && rightMovie) {
    runComparison();
  }
};

const runComparison = () => {
  const leftSideStats = document.querySelectorAll(
    '#left-summary .notification'
  );
  const rightSideStats = document.querySelectorAll(
    '#right-summary .notification'
  );

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];

    const leftSideValue = leftStat.dataset.value;
    const rightSideValue = rightStat.dataset.value;
    if (rightSideValue > leftSideValue) {
      leftStat.classList.remove('is-primary');
      leftStat.classList.add('is-warning');
    } else {
      rightStat.classList.remove('is-primary');
      rightStat.classList.add('is-warning');
    }
  });
};
const movieTemplate = movieDetails => {
  const dollars = parseInt(
    movieDetails?.BoxOffice?.replace(/\$/g, '').replace(/,/g, '')
  );
  const metascore = parseInt(movieDetails?.Metascore);
  const imdbRating = parseFloat(movieDetails.imdbRating);
  const imdbVotes = parseFloat(movieDetails.imdbVotes.replace(/,/g, ''));
  let count = 0;
  const awards = movieDetails.Awards?.split(' ').reduce((prev, word) => {
    const value = parseInt(word);
    if (isNaN(value)) return prev;
    else return prev + value;
  }, 0);

  const id = movieDetails.imdbID;
  return `
    <article class='media'>
      <figure class='media-left'>
        <p class='image'>
          <img src='${movieDetails.Poster}' />
        </p>
      </figure>
      <div class='media-content'>
        <div class='content'>
          <h1>${movieDetails.Title}</h1>
          <h4>${movieDetails.Genre}</h4>
          <p>${movieDetails.Plot}</p>
        </div>
      </div>
    </article>
    <article data-value=${awards} id='${
    id + 'Awards'
  }' class='notification is-primary'>
      <p class='title'>${movieDetails.Awards}</p>
      <p class='subtitle'>Awards</p>
    </article>
    <article data-value=${dollars} id='${
    id + 'BoxOffice'
  }' class='notification is-primary'>
      <p class='title'>${movieDetails.BoxOffice}</p>
      <p class='subtitle'>BoxOffice</p>
    </article>
    <article data-value=${metascore} id='${
    id + 'Metascore'
  }' class='notification is-primary'>
      <p class='title'>${movieDetails.Metascore}</p>
      <p class='subtitle'>Metascore</p>
    </article>
    <article data-value=${imdbRating} id='${
    id + 'imdbRating'
  }' class='notification is-primary'>
      <p class='title'>${movieDetails.imdbRating}</p>
      <p class='subtitle'>IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} id='${
    id + 'imdbVotes'
  }' class='notification is-primary'>
      <p class='title'>${movieDetails.imdbVotes}</p>
      <p class='subtitle'>IMDB Votes</p>
    </article>
  `;
};
