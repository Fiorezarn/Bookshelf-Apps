/**
 * [
 *    {
 *      id: <int>
        title: <string>
        author: <string>
        year: <int>
        isComplete: <boolean>
 *    }
 * ]
 */
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "BOOKSHELF_APPS";
const SAVED_EVENT = "BOOKSHELF_SAVED";

const books = [];

function generateBookId() {
  return +new Date();
}

function generateBook(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookID) {
  for (const bookItem of books) {
    if (bookItem.id == bookID) {
      return bookItem;
    }
  }
  return null;
}
function findBookIndex(bookID) {
  for (const index in books) {
    if (books[index].id === bookID) {
      return index;
    }
  }

  return -1;
}

function makeBook(book) {
  const title = document.createElement("h3");
  title.innerText = book.title;

  const author = document.createElement("p");
  author.innerText = "Penulis : " + book.author;

  const year = document.createElement("p");
  year.innerText = "Tahun : " + book.year;

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.append(title, author, year);
  container.setAttribute("id", `book-${book.id}`);

  if (book.isComplete) {
    const unreadButton = document.createElement("button");
    unreadButton.classList.add("green");
    unreadButton.innerText = "Belum selesai dibaca";

    unreadButton.addEventListener("click", function () {
      const confirmation = confirm("Apakah Anda ingin memindahkan ke rak belum selesai dibaca?");

      if (confirmation) {
      addBookToUncompleted(book.id);
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus Buku";

    deleteButton.addEventListener("click", function () {
      const confirmation = confirm("Apa kamu yakin? Anda tidak akan dapat mengembalikan ini!");

      if (confirmation) {
        alert("File anda berhasil dihapus!");
        removeBook(book.id);
      }
    });


    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action");
    actionContainer.append(unreadButton, deleteButton);

    container.append(actionContainer);
  } else {
    const readedButoon = document.createElement("button");
    readedButoon.classList.add("green");
    readedButoon.innerText = "Selesai dibaca";

    readedButoon.addEventListener("click", function () {
      const confirmation = confirm("Apakah Anda ingin memindahkan ke rak selesai dibaca?");

      if (confirmation) {
        addBookToCompleted(book.id);
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus Buku";

    deleteButton.addEventListener("click", function () {
      const confirmation = confirm("Apa Anda yakin? Anda tidak akan dapat mengembalikan ini!");

      if (confirmation) {
        alert("File anda berhasil dihapus!");
        removeBook(book.id);
      }
    });

    const action = document.createElement("div");
    action.classList.add("action");
    action.append(readedButoon, deleteButton);

    container.append(action);
  }

  return container;
}


function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;
  
  const generateBookID = generateBookId();
  const book = generateBook(generateBookID, title, author, year, isComplete);
  books.push(book);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBook = document.getElementById("incompleteBookshelfList");
  incompleteBook.innerHTML = "";

  const completeBook = document.getElementById("completeBookshelfList");
  completeBook.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      completeBook.append(bookElement);
    } else {
      incompleteBook.append(bookElement);
    }
  }
});

function addBookToCompleted(bookID) {
  const bookTarget = findBook(bookID);
  
  if (bookTarget == null) return;
  
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToUncompleted(bookID) {
  const bookTarget = findBook(bookID);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookID) {
  const bookTarget = findBookIndex(bookID);
  
  if (bookTarget === -1) {
    return;
  }
  
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

const searchBookForm = document.getElementById("searchBook");
searchBookForm.addEventListener("submit", function (event) {
  event.preventDefault();
  filterBooks();
});

const filterBooks = () => {
  const searchKeyword = document.getElementById("searchBookTitle").value.toLowerCase();
  const filteredBooks = books.filter(function (book) {
    const title = book.title.toLowerCase();
    const author = book.author.toLowerCase();
    const year = book.year.toString();
    return title.includes(searchKeyword) || author.includes(searchKeyword) || year.includes(searchKeyword);
  });
  if (filteredBooks.length === 0) {
    alert(`${searchKeyword} tidak ditemukan`)
    }
  displayFilteredBooks(filteredBooks);
};

function displayFilteredBooks(books) {
  const incompleteBookshelf = document.getElementById("incompleteBookshelfList");
  incompleteBookshelf.innerHTML = "";
  
  const completeBookshelf = document.getElementById("completeBookshelfList");
  completeBookshelf.innerHTML = "";
  
  for (const book of books) {
    const bookElement = makeBook(book);
    if (book.isComplete) {
      completeBookshelf.append(bookElement);
    } else {
      incompleteBookshelf.append(bookElement);
    }
  }
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}