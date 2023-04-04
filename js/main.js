import pickRandomName from "./catlist.js";
import { NetworkError } from "./utils.js";

const APP = {
  categoriesUrl: "https://api.thecatapi.com/v1/categories",
  baseUrl: "https://api.thecatapi.com/v1/images/search/",
  query: "?limit=15&category_ids=",
  apiKey:
    "api_key=live_FTVnRHErACUhKCZd4mkQqS6oajuNm5Ayh3ozA05yVUpTPgjnqPzzjKpQ0MCbfaqm",
  key: "roy-catnames-310",
  categorySelect: document.getElementById("category"),
  catNamesLocalObj: {},
  loaderWrap: document.querySelector(".loader-circle-wrap"),
  loaderSpinner: document.querySelector(".loader-spinner"),
  catCards: document.getElementById("cat-cards"),

  init: () => {
    let store = localStorage.getItem(APP.key);

    if (store === null) {
      localStorage.setItem(APP.key, JSON.stringify(APP.catNamesLocalObj));
    } else {
      APP.catNamesLocalObj = JSON.parse(store);
    }

    let defaultCategory = APP.createOption(
      "Please choose an option",
      "default"
    );

    APP.categorySelect.appendChild(defaultCategory);

    APP.fetchCategories();
  },
  createOption: (categoryName, categoryId) => {
    const option = document.createElement("option");
    option.value = categoryId;
    option.id = categoryId;
    option.textContent = categoryName;
    return option;
  },
  fetchCategories: () => {
    fetch(APP.categoriesUrl)
      .then((res) => {
        if (!res.ok)
          throw new NetworkError(
            "Something went wrong. Please choose a category.",
            res
          );
        return res.json();
      })
      .then((data) => APP.showCategories(data))
      .catch((err) => {
        document.querySelector(".choose").style.display = "none";
        APP.showErrorMessage(err.message);
      });
  },
  showCategories: (categories) => {
    categories.forEach((category) => {
      let categoryOption = APP.createOption(
        `${category.name}`,
        `${category.id}`
      );

      APP.categorySelect.appendChild(categoryOption);
    });

    APP.categorySelect.addEventListener("change", APP.fetchCats);
  },
  fetchCats: (ev) => {
    document.querySelector(".choose").style.display = "none";

    APP.catCards.innerHTML = "";
    if (ev.target.value === "default") {
      document.querySelector(".choose").style.display = "inline";
      return;
    } else {
      APP.spin();
    }

    const category = ev.target.selectedOptions[0].id;

    if (category) {
      const categoryId = category;

      const url = APP.baseUrl + APP.query + categoryId + "&" + APP.apiKey;

      fetch(url)
        .then((res) => {
          if (!res.ok)
            throw new NetworkError(
              "No results were found. Please choose a category.",
              res
            );
          APP.spin(false);
          return res.json();
        })
        .then((data) => APP.showCats(data))
        .catch((err) => {
          APP.spin(false);
          document.querySelector(".choose").style.display = "none";
          APP.showErrorMessage(err.message);
        });
    }
  },
  showCats: (cats) => {
    APP.spin(false);

    APP.catCards.innerHTML = cats
      .map((cat) => {
        if (cat.id in APP.catNamesLocalObj) {
          console.log(cat.id, "exists in local storage!");
          return `<li class="card"><img src=${
            cat.url
          } alt="image of a random cat"/><h3>${
            APP.catNamesLocalObj[cat.id]
          }</h3>
          </li>`;
        } else {
          APP.catNamesLocalObj[cat.id] = pickRandomName();
          localStorage.setItem(APP.key, JSON.stringify(APP.catNamesLocalObj));
          return `<li class="card"><img src=${
            cat.url
          } alt="image of a random cat"/><h3>${
            APP.catNamesLocalObj[cat.id]
          }</h3> </li>`;
        }
      })
      .join("");
  },
  spin: (show = true) => {
    if (show) {
      APP.loaderWrap.classList.add("active");
      APP.loaderSpinner.classList.add("active");
    } else {
      APP.loaderWrap.classList.remove("active");
      APP.loaderSpinner.classList.remove("active");
    }
  },
  showErrorMessage: (message) => {
    let error = document.querySelector(".error-message");
    error.innerHTML = `<div><span class="material-symbols-outlined">
    error
    </span></div><div><p class="error">${message}</p></div>`;
  },
};

document.addEventListener("DOMContentLoaded", APP.init);
