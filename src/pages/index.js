import "./index.css";

import {
  enableValidation,
  validationConfig,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

import avatarDefaultSrc from "../images/avatar.jpg";
import pencilSrc from "../images/pencil.svg";
import plusSrc from "../images/plus.svg";

const avatarImage = document.getElementById("image-avatar");
const pencilImage = document.getElementById("image-pencil");
const plusImage = document.getElementById("image-plus");

pencilImage.src = pencilSrc;
plusImage.src = plusSrc;

// const initialCards = [
//   {
//     name: "Val Thorens",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
//   },
//   {
//     name: "Restaurant terrace",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
//   },
//   {
//     name: "An outdoor cafe",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
//   },
//   {
//     name: "A very long bridge, over the forest and through the trees",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
//   },
//   {
//     name: "Tunnel with morning light",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
//   },
//   {
//     name: "Mountain house",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
//   },
//   {
//     name: "Golden Gate bridge",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
//   },
// ];

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "5c5e8493-0c05-4681-9b3f-3ec87ded6695",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userData]) => {
    console.log("User Data received:", userData);
    console.log("Avatar URL:", userData.avatar);
    cards.forEach((item) => {
      const cardEl = getCardElement(item);
      cardList.append(cardEl);
    });

    profileNameEl.textContent = userData.name;
    profileDescriptionEl.textContent = userData.about;
    avatarImage.src = userData.avatar;
    console.log("Setting up avatar handlers");
    avatarImage.onerror = function () {
      console.log("Avatar failed to load, falling back to:", avatarDefaultSrc);
      this.src = avatarDefaultSrc;
    };
    avatarImage.onload = function () {
      console.log("Avatar loaded successfully");
    };
    console.log("Setting avatar src to:", userData.avatar);
    avatarImage.src = userData.avatar;
  })
  .catch(console.error);

// Profile Elements
const editModalBtn = document.querySelector(".profile__edit-btn");
const cardModalBtn = document.querySelector(".profile__add-btn");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

// Form Elements
const editModal = document.querySelector("#edit-modal");
const profileForm = document.forms["profile-form"];

const nameInput = editModal.querySelector("#profile-name-input");
const descriptionInput = editModal.querySelector("#profile-description-input");

const cardModal = document.querySelector("#add-card-modal");
const cardForm = document.forms["card-form"];
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close");
const cardNameInput = cardModal.querySelector("#card-name-input");
const cardLinkInput = cardModal.querySelector("#card-link-input");

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalDeleteBtn = previewModal.querySelector(
  ".modal__close_type_preview"
);

// Card related Elements
const cardTemplate = document.querySelector("#card-template");
const cardList = document.querySelector(".cards__list");

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImgEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  cardNameEl.textContent = data.name;
  cardImgEl.src = data.link;
  cardImgEl.alt = data.name;

  cardLikeBtn.addEventListener("click", () => {
    cardLikeBtn.classList.toggle("card__like-btn_liked");
  });

  cardDeleteBtn.addEventListener("click", () => {
    cardElement.remove();
  });

  cardImgEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.link;
    previewModalCaptionEl.textContent = data.name;
  });

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscClose);
  modal.addEventListener("mousedown", handleOverLayClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscClose);
  modal.removeEventListener("mousedown", handleOverLayClose);
}

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  api
    .editUserInfo({ name: nameInput.value, about: descriptionInput.value })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
    })
    .catch(console.error);

  closeModal(editModal);
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const inputValues = { name: cardNameInput.value, link: cardLinkInput.value };
  const cardEl = getCardElement(inputValues);
  cardList.prepend(cardEl);
  evt.target.reset();
  disableButton(cardSubmitBtn, validationConfig);
  closeModal(cardModal);
}

function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const activeModal = document.querySelector(".modal_opened");
    closeModal(activeModal);
  }
}

function handleOverLayClose(evt) {
  if (evt.target.classList.contains("modal")) {
    closeModal(evt.target);
  }
}

editModalBtn.addEventListener("click", () => {
  nameInput.value = profileNameEl.textContent;
  descriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(profileForm, [nameInput, descriptionInput], validationConfig);
  openModal(editModal);
});

const closeButtons = document.querySelectorAll(".modal__close");
closeButtons.forEach((button) => {
  const popup = button.closest(".modal");
  button.addEventListener("click", () => closeModal(popup));
});

cardModalBtn.addEventListener("click", () => {
  openModal(cardModal);
});

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);

enableValidation(validationConfig);
