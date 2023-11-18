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
        name: 'title',
        message: 'Please enter a book title --',
      },
    ])
    .then((answers) => {
      console.log(
        "Good choice! I'll see if we have it, now processing, please wait..."
      )
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${answers.title}+inauthor:${answers.author}`
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
      const textToWrite = `          Title: ${volInfo.title}
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
        type: 'list',
        name: 'genre',
        message: 'Please choose a genre --',
        choices: [
          'Fiction',
          'Art',
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
        ],
      },
    ])
    .then(({ genre }) => {
      if (genre === 'Fiction') {
        return inquirer.prompt([
          {
            type: 'list',
            name: 'genre',
            message: 'Please choose a sub-genre for Fiction --',
            choices: [
              'Action & Adventure',
              'Animals',
              'Classics',
              'Dystopian',
              'Fantasy',
              'Horror',
              'Mystery & Detective',
              'Romance',
              'Science Fiction',
              'Sports',
              'Thrillers',
            ],
          },
        ])
      } else if (genre === 'Art') {
        return inquirer.prompt([
          {
            type: 'list',
            name: 'genre',
            message: 'Please choose a sub-genre for Art --',
            choices: [
              'Art & Politics',
              'Body Art & Tattooing',
              'Ceramics',
              'Color Theory',
              'Digital',
              'Film & Video',
              'Graffiti & Street Art',
              'LGBTQ+ Artists',
              'Popular Culture',
              'Sculpture & Installation',
              'Video Game Art',
            ],
          },
        ])
      }
    })

    .then((answers) => {
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${answers.genre}`
      )
    })
    .then((searchObject) => {
      const { title, authors, publisher, publishedDate, description } =
        searchObject.data.items[0].volumeInfo
      const textToWrite =     `          Title: ${title}
          Authors: ${authors}
          Publisher: ${publisher}
          Published Date: ${publishedDate}
          Description: ${description}`
      console.log(textToWrite)
    })
    .catch((err) => {
      console.log(err)
    })
}

const masterFunction = () => {
  requestAnAuthorAndBook().then((searchObject) => {
    requestFurtherInfo(searchObject).then(() => {
      repeatSearch()
    })
  })
}

// masterFunction()

searchByGenre()

//Dev notes
/* recursion working. Master function improved
additional functions to consider
search by genre
provide top rated books by an author
need to deal with error when author is not shown to book eg stan lee spiderman
*/
