import "./index.css";

import {
  enableValidation,
  validationConfig,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";
import { setButtonText, setDeleteText } from "../utils/helpers.js";

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

let currentUser;

api
  .getAppInfo()
  .then(([cards, userData]) => {
    console.log("All cards:", cards);
    console.log("User data:", userData);
    currentUser = userData;
    profileNameEl.textContent = userData.name;
    profileDescriptionEl.textContent = userData.about;
    avatarImage.src = userData.avatar || avatarDefaultSrc;
    console.log("Avatar src set to:", avatarImage.src);

    if (Array.isArray(cards)) {
      cards.forEach((item) => {
        const cardEl = getCardElement(item);
        cardList.prepend(cardEl);
      });
    } else {
      console.error("Cards is not an array:", cards);
    }
  })
  .catch((error) => {
    console.error("API Error:", error);
  });

// Profile Elements
const editModalBtn = document.querySelector(".profile__edit-btn");
const cardModalBtn = document.querySelector(".profile__add-btn");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

// Form Elements
const editModal = document.querySelector("#edit-modal");
const profileForm = document.forms["profile-form"];
const nameInput = editModal.querySelector("#profile-name-input");
const descriptionInput = editModal.querySelector("#profile-description-input");

// Card Elements
const cardModal = document.querySelector("#add-card-modal");
const cardForm = document.forms["card-form"];
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close");
const cardNameInput = cardModal.querySelector("#card-name-input");
const cardLinkInput = cardModal.querySelector("#card-link-input");

// Avatar Elements
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = document.forms["avatar-form"];
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

// Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = document.forms["delete-form"];

// Preview Elements
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalDeleteBtn = previewModal.querySelector(
  ".modal__close_type_preview"
);

// Card related Elements
const cardTemplate = document.querySelector("#card-template");
const cardList = document.querySelector(".cards__list");

let selectedCard, selectedCardId;

function getCardElement(data) {
  console.log("Creating card for:", data);
  const cardElement = cardTemplate.content.cloneNode(true).firstElementChild;
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");
  const cardLikeCount = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  if (data && data.likes && Array.isArray(data.likes)) {
    cardLikeCount.textContent = data.likes.length;

    if (data.likes.some((user) => user._id === currentUser._id)) {
      cardLikeBtn.classList.add("card__like-btn_liked");
    }
  } else {
    cardLikeCount.textContent = 0;
  }

  cardLikeBtn.addEventListener("click", (evt) => {
    handleLike(evt, data._id);
  });

  cardDeleteBtn.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );

  cardImage.addEventListener("click", () => {
    console.log("Preview modal:", previewModal);
    console.log("Preview modal image:", previewModalImageEl);
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.link;
    previewModalCaptionEl.textContent = data.name;
  });

  console.log("Card element created:", cardElement);
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

function handleLike(evt, id) {
  const isLiked = evt.target.classList.contains("card__like-btn_liked");
  const likeCountElement = evt.target
    .closest(".card")
    .querySelector(".card__like-count");

  const currentLikes = parseInt(likeCountElement.textContent);

  api
    .handleLikeStatus(id, isLiked)
    .then((data) => {
      if (data) {
        evt.target.classList.toggle("card__like-btn_liked");
        likeCountElement.textContent = data.isLiked
          ? currentLikes + 1
          : currentLikes - 1;
      }
    })
    .catch(console.error);
}

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);

  api
    .editUserInfo({ name: nameInput.value, about: descriptionInput.value })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });

  closeModal(editModal);
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .addCard({ name: cardNameInput.value, link: cardLinkInput.value })
    .then((data) => {
      const cardEl = getCardElement(data);
      cardList.prepend(cardEl);
      evt.target.reset();
      disableButton(cardSubmitBtn, validationConfig);
      closeModal(cardModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .editAvatarInfo({ avatar: avatarInput.value })
    .then((data) => {
      avatarImage.src = data.avatar;
      evt.target.reset();
      closeModal(avatarModal);
      disableButton(avatarSubmitBtn, validationConfig);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleDeleteSubmit(evt) {
  console.log(selectedCardId);
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setDeleteText(submitBtn, true);
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
    })
    .catch(console.error)
    .finally(() => {
      setDeleteText(submitBtn, false);
    });

  closeModal(deleteModal);
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
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

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);

enableValidation(validationConfig);
