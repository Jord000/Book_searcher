const inquirer = require('inquirer')
const axios = require('axios')
const fsPromise = require('fs/promises')
const { promiseHooks } = require('v8')

const requestAnAuthorAndBook = () => {
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

const requestFurtherInfo = (searchObject) => {
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

const searchByGenre = () => {
  return inquirer
    .prompt([
      {
        type:'list',
        name: 'genre',
        message: 'Please choose a genre --',
        choices: [
      'Fiction',
      //choices available - action & adventure, animals, classics, dystopian, Fantasy,Horror,Mystery & Detective, Romance, Science Fiction, Sports, Thrillers
      'Art', //try another keyword to help the search
      'Cooking',
      'Drama',
      'History',
      'Nature',
      'Philosophy',
      'Religion',
      'Science',
      'Technology',
      'Travel',
      'True Crime',
            ]
      },
    ])
    .then((answers) => {
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${answers.genre}`
      )
    })
    .then((searchObject) => {
      console.log(searchObject.data.items[0].volumeInfo)
    })
    .catch((err) => {
      console.log(err)
    })
}

const masterFunction = () => {
  return Promise.all([requestAnAuthorAndBook()]).then((searchObject) => {
    Promise.all([requestFurtherInfo(searchObject)]).then(() => {
      repeatSearch()
    })
  })
}

// masterFunction()

searchByGenre()

//Dev notes
/* recursion working. Master function could be improved
need to deal with error when author is not shown to book eg stan lee spiderman
additional functions to consider
search by genre
provide top rated books by an author
*/
