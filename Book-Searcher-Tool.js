const inquirer = require('inquirer')
const axios = require('axios')
const fsPromise = require('fs/promises')
const { promiseHooks } = require('v8')

const fileCheck = fsPromise.access(`${__dirname}/books-found`).catch(() => {
  return fsPromise.mkdir(`${__dirname}/books-found`)
})

const requestAnAuthorAndBook = () => {
  return inquirer
    .prompt([
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

      console.log(`
      Your chosen book: 
      ${authors}
      ${title}
      `)
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
          'Would you like more info on this book? Y/N --- your file book.details.txt will be made in the directory',
      },
    ])
    .then((answer) => {
      const volInfo = searchObject.data.items[0].volumeInfo
      const textToWrite = `          Title: ${volInfo.title}
          Authors: ${volInfo.authors}
          Publisher: ${volInfo.publisher}
          Published Date: ${volInfo.publishedDate}
          Description: 
          
${volInfo.description}
          ___________`
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
      console.log('no book found')
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
        console.log(`
        _______________________________________________
        Thank you, enjoy your book info!...Goodbye!...
        _______________________________________________`)
      }
    })
}

const searchByGenre = () => {
  let genreChosen = ''
  return (
    inquirer
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
        } else {
          return { genre: genre }
        }
      })
      .then(({ genre }) => {
        genreChosen = genre
        return axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}`
        )
      })
      .then((searchObject) => {
        const resultsArray = searchObject.data.items
        return inquirer.prompt([
          {
            type: 'list',
            name: 'topGenre',
            message: `
Please choose one of the top results for ${genreChosen} --`,
            choices: [
              `${resultsArray[0].volumeInfo.title} by ${resultsArray[0].volumeInfo.authors}`,
              `${resultsArray[1].volumeInfo.title} by ${resultsArray[2].volumeInfo.authors}`,
              `${resultsArray[2].volumeInfo.title} by ${resultsArray[3].volumeInfo.authors}`,
              `${resultsArray[3].volumeInfo.title} by ${resultsArray[4].volumeInfo.authors}`,
              `${resultsArray[4].volumeInfo.title} by ${resultsArray[5].volumeInfo.authors}`,
            ],
          },
        ])
      })
      .then(({ topGenre }) => {
        return axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=:${topGenre}`
        )
      })

      //
      .then((searchObject) => {
        const { title, authors, publisher, publishedDate, description } =
          searchObject.data.items[0].volumeInfo
        const genreBook = `         
          Your Chosen book in ${genreChosen}:   
          Title: ${title}
          Authors: ${authors}`
        console.log(genreBook)
        return searchObject
      })
      .catch((err) => {
        console.log(err)
      })
  )
}

const topBooksByAuthor = () => {
  let authorChosen = ''
  return inquirer
    .prompt([
      {
        name: 'author',
        message: 'Please enter an author --',
      },
    ])
    .then(({ author }) => {
      authorChosen = author
      console.log(
        `Good choice! Let's see if we can get ${author}'s top books, now processing, please wait...`
      )
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=inauthor:${author}`
      )
    })
    .then((searchObject) => {
      const resultsArray = searchObject.data.items
      return inquirer.prompt([
        {
          type: 'list',
          name: 'authorsTopBooks',
          message: `
Please choose one of the top results for ${authorChosen} --`,
          choices: [
            `${resultsArray[0].volumeInfo.title} by ${resultsArray[0].volumeInfo.authors}`,
            `${resultsArray[1].volumeInfo.title} by ${resultsArray[2].volumeInfo.authors}`,
            `${resultsArray[2].volumeInfo.title} by ${resultsArray[3].volumeInfo.authors}`,
            `${resultsArray[3].volumeInfo.title} by ${resultsArray[4].volumeInfo.authors}`,
            `${resultsArray[4].volumeInfo.title} by ${resultsArray[5].volumeInfo.authors}`,
          ],
        },
      ])
    })
    .then(({ authorsTopBooks }) => {
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=:${authorsTopBooks}`
      )
    })
    .catch('no books found')
}

const masterFunction = () => {
  return inquirer
    .prompt([
      {
        name: 'welcome',
        message: `      
         Welcome to Book-Searcher-Tool, 
         Using Google API to find top results on books.
         
         Please press enter to proceed...
         ________________________________`,
      },
      {
        type: 'rawlist',
        name: 'menu',
        message: `Please choose a method of searching books...
      
    Search by `,
        choices: ['Title & Author', 'Genre', 'Top Books By Author'],
      },
    ])
    .then(({ menu }) => {
      if (menu === 'Title & Author') {
        requestAnAuthorAndBook().then((searchObject) => {
          requestFurtherInfo(searchObject).then(() => {
            repeatSearch()
          })
        })
      } else if (menu === 'Genre') {
        searchByGenre().then((searchObject) => {
          requestFurtherInfo(searchObject).then(() => {
            repeatSearch()
          })
        })
      } else if (menu === 'Top Books By Author') {
        topBooksByAuthor().then((searchObject) => {
          requestFurtherInfo(searchObject).then(() => {
            repeatSearch()
          })
        })
      }
    })
}

masterFunction()

//Dev notes
/* recursion working. Master function improved
additional functions to consider
provide top rated books by an author
need to deal with error when author is not shown to book eg stan lee spiderman
*/
