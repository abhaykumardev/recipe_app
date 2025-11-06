const searchbtn = document.querySelector(".searchbtn");
const searchbox = document.querySelector(".searchbox");
const recipecontainer = document.querySelector(".recipe-container");
const recipedetailContent = document.querySelector(".recipe-detail-content");
const recipeclosebtn = document.querySelector(".recipe-close-btn");
const favouritesContainer = document.querySelector(".favourites-container");

// Get favorites from localStorage (if any)
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

// Function to get recipes
const fetchrecipe = async (query) => {
  recipecontainer.innerHTML = "<h2>Fetching Recipes for you...</h2>";

  const data = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
  const responce = await data.json();

  recipecontainer.innerHTML = "";

  if (!responce.meals) {
    recipecontainer.innerHTML = "<h2>No recipes found. Try another search!</h2>";
    return;
  }

  responce.meals.forEach((meal) => {
    const recipediv = document.createElement("div");
    recipediv.classList.add("recipe");
    recipediv.innerHTML = `
      <img src="${meal.strMealThumb}">
      <h3>${meal.strMeal}</h3>
      <p><span>${meal.strArea}</span> Dish</p>
      <p>Belongs to <span>${meal.strCategory}</span> Category</p>
    `;

    // View Recipe button
    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View Recipe";
    viewBtn.addEventListener("click", () => openrecipepopup(meal));
    recipediv.appendChild(viewBtn);

    // Add to Favourites button ❤️
    const favBtn = document.createElement("button");
    favBtn.textContent = "Add to Favourites ❤️";
    favBtn.addEventListener("click", () => addToFavourites(meal));
    recipediv.appendChild(favBtn);

    recipecontainer.appendChild(recipediv);
  });
};

// Function to fetch ingredients
const fetchingredient = (meal) => {
  let ingredient_list = "";
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    if (ingredient) {
      const measure = meal[`strMeasure${i}`];
      ingredient_list += `<li>${measure} ${ingredient}</li>`;
    } else {
      break;
    }
  }
  return ingredient_list;
};

// Function to open recipe popup
const openrecipepopup = (meal) => {
  recipedetailContent.innerHTML = `
    <h2 class="recipename">${meal.strMeal}</h2>
    <h3>Ingredients:</h3>
    <ul class="ingredientlist">${fetchingredient(meal)}</ul>
    <div class="recipeinstruction">
      <h3>Instructions:</h3>
      <p>${meal.strInstructions}</p>
    </div>
    <button class="download-btn">📄 Download Recipe</button>
  `;
  recipedetailContent.parentElement.style.display = "block";

  // PDF Download
  const downloadBtn = recipedetailContent.querySelector(".download-btn");
  downloadBtn.addEventListener("click", () => downloadRecipePDF(meal));
};

// Close popup
recipeclosebtn.addEventListener("click", () => {
  recipedetailContent.parentElement.style.display = "none";
});

// Add recipe to favourites
function addToFavourites(meal) {
  if (favourites.some(fav => fav.idMeal === meal.idMeal)) {
    alert("Already in favourites!");
    return;
  }

  favourites.push(meal);
  localStorage.setItem("favourites", JSON.stringify(favourites));
  alert(`${meal.strMeal} added to favourites!`);
  displayFavourites();
}

// Remove from favourites
function removeFromFavourites(idMeal) {
  favourites = favourites.filter(fav => fav.idMeal !== idMeal);
  localStorage.setItem("favourites", JSON.stringify(favourites));
  displayFavourites();
}

// Display favourites section
function displayFavourites() {
  favouritesContainer.innerHTML = "";

  if (favourites.length === 0) {
    favouritesContainer.innerHTML = "<p>No favourites yet. Add some!</p>";
    return;
  }

  favourites.forEach(meal => {
    const favDiv = document.createElement("div");
    favDiv.classList.add("recipe");
    favDiv.innerHTML = `
      <img src="${meal.strMealThumb}">
      <h3>${meal.strMeal}</h3>
      <p>${meal.strArea} Dish</p>
      <p>Category: ${meal.strCategory}</p>
    `;

    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View Recipe";
    viewBtn.addEventListener("click", () => openrecipepopup(meal));

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove ❌";
    removeBtn.style.background = "crimson";
    removeBtn.addEventListener("click", () => removeFromFavourites(meal.idMeal));

    favDiv.appendChild(viewBtn);
    favDiv.appendChild(removeBtn);
    favouritesContainer.appendChild(favDiv);
  });
}

// Generate a PDF file for the selected recipe
function downloadRecipePDF(meal) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(meal.strMeal, 10, 20);

  // Ingredients section
  doc.setFontSize(14);
  doc.text("Ingredients:", 10, 35);
  doc.setFont("helvetica", "normal");

  let y = 45;
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && measure) {
      doc.text(`• ${measure} ${ingredient}`, 12, y);
      y += 8;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }
  }

  // Instructions
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Instructions:", 10, y);
  doc.setFont("helvetica", "normal");

  const splitText = doc.splitTextToSize(meal.strInstructions, 180);
  y += 10;
  doc.text(splitText, 10, y);

  // Save PDF
  doc.save(`${meal.strMeal}.pdf`);
}

// On page load, show saved favourites
displayFavourites();

// Search handler
searchbtn.addEventListener("click", (e) => {
  e.preventDefault();
  const searchinput = searchbox.value.trim();
  if (!searchinput) {
    recipecontainer.innerHTML = `<h2>Type the meal in search Box</h2>`;
    return;
  }
  fetchrecipe(searchinput);
});
