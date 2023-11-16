const inquirer = require('inquirer')
const axios = require('axios')
const fsPromise = require('fs/promises')
const { promiseHooks } = require('v8')

function requestAnAuthorAndBook() {
  return inquirer
    .prompt([
      {
        name: 'welcome',
        message:
          'Welcome to the virtual library, please press enter to proceed...',
      },
      {
        name: 'author',
        message: 'Please enter an author --',
      },
      {
        name: 'book1',
        message: 'Please enter a book title --',
      },
    ])
    .then((answers) => {
      console.log(
        "Good choice! I'll see if we have it, now processing, please wait..."
      )
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${answers.book1}+inauthor:${answers.author}`
      )
    })
    .then((searchObject) => {
      const authors = searchObject.data.items[0].volumeInfo.authors.join(' ')
      const title = searchObject.data.items[0].volumeInfo.title

      console.log(authors, title)
      return searchObject
    })
    .catch((err) => {
      console.log('no books found')
    })
}

function requestFurtherInfo(searchObject) {
  return inquirer
    .prompt([
      {
        name: 'moreInfo',
        message:
          'Would you like more info on this book? Y/N --- after your file book.details.txt will be made in the directory',
      },
    ])
    .then((answer) => {
      const volInfo = searchObject[0].data.items[0].volumeInfo
      const textToWrite = `Title: ${volInfo.title}
          Authors: ${volInfo.authors}
          Publisher: ${volInfo.publisher}
          Published Date: ${volInfo.publishedDate}
          Description: ${volInfo.description}`
      if (
        answer.moreInfo.toLowerCase() === 'y' ||
        answer.moreInfo.toLowerCase() === 'yes'
      ) {
        console.log(textToWrite)
      } else {
        console.log(
          'thank you, your file author-bookName.txt will be sent to found-books folder, goodbye...'
        )
      }
      const fileCheck = fsPromise
        .access(`${__dirname}/books-found`)
        .catch(() => {
          return fsPromise.mkdir(`${__dirname}/books-found`)
        })
      //
      return Promise.all([textToWrite, volInfo, fileCheck])
    })
    .then(([textToWrite, volInfo]) => {
      return fsPromise.writeFile(
        `${__dirname}/books-found/${volInfo.authors}-${volInfo.title}.txt`,
        textToWrite,
        'utf-8'
      )
    })
    .catch((err) => {
      console.log('info error')
    })
}

const repeatSearch = () => {
  return inquirer
    .prompt([
      {
        name: 'repeat',
        message: 'Would you like to search again? Y/N',
      },
    ])
    .then((answer) => {
      if (answer.repeat.toLowerCase() === 'y') {
        masterFunction()
      } else {
        console.log('Thank you, enjoy your book info!...Goodbye!...')
      }
    })
}

const masterFunction = () => {
  return Promise.all([requestAnAuthorAndBook()]).then((searchObject) => {
    Promise.all([requestFurtherInfo(searchObject)]).then(() => {
      repeatSearch()
    })
  })
}

masterFunction()
/* loop now working promises inside promises could work better with one large async await function but need more training for this */

/* additional functions to consider
search by genre
provide top rated books by an author
*/
