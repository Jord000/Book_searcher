#!/usr/bin/env node

const inquirer = require('inquirer');
const axios = require('axios');
const fsPromise = require('fs/promises');

const fileCheck = fsPromise.access(`${__dirname}/books-found`).catch(() => {
  return fsPromise.mkdir(`${__dirname}/books-found`);
});

const requestAnAuthorAndBook = () => {
  let authorChosen = '';
  let titleChosen = '';
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
    .then(({ title, author }) => {
      authorChosen = author;
      titleChosen = title;
      console.log(
        "Good choice! I'll see if we have it, now processing, please wait..."
      );
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${title}+inauthor:${author}`
      );
    })
    .then((searchObject) => {
      const resultsArray = searchObject.data.items;
      if (!resultsArray) {
        return Promise.reject(new Error('No Book Found'));
      } else {
        return inquirer.prompt([
          {
            type: 'list',
            name: 'authorAndTitle',
            message: `
Please choose one of the top results for ${authorChosen}, ${titleChosen} --`,
            choices: [
              {
                name: `${resultsArray[0].volumeInfo.title} by ${resultsArray[0].volumeInfo.authors}`,
                value: resultsArray[0].id,
              },
              {
                name: `${resultsArray[1].volumeInfo.title} by ${resultsArray[1].volumeInfo.authors}`,
                value: resultsArray[1].id,
              },
              {
                name: `${resultsArray[2].volumeInfo.title} by ${resultsArray[2].volumeInfo.authors}`,
                value: resultsArray[2].id,
              },
              {
                name: `${resultsArray[3].volumeInfo.title} by ${resultsArray[3].volumeInfo.authors}`,
                value: resultsArray[3].id,
              },
              {
                name: `${resultsArray[4].volumeInfo.title} by ${resultsArray[4].volumeInfo.authors}`,
                value: resultsArray[4].id,
              },
            ],
          },
        ]);
      }
    })
    .then(({ authorAndTitle }) => {
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${authorAndTitle}`
      );
    })
    .then((searchObject) => {
      const { title, authors } = searchObject.data.items[0].volumeInfo;
      const authorBook = `         
          Your Chosen book for ${authorChosen} ${titleChosen}:   
          Title: ${title}
          Authors: ${authors}`;
      console.log(authorBook);
      return searchObject;
    })
    .catch((err) => {
      console.log('Error - No Book Found');
    });
};

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
      const volInfo = searchObject.data.items[0].volumeInfo;
      const textToWrite = `          Title: ${volInfo.title || 'No Title'}
          Authors: ${volInfo.authors || 'No Author'}
          Publisher: ${volInfo.publisher || 'No Publisher'}
          Published Date: ${volInfo.publishedDate || 'No Publish Date'}
          Description: 
          
${volInfo.description || 'No Description'} 
          ___________`;
      if (
        answer.moreInfo.toLowerCase() === 'y' ||
        answer.moreInfo.toLowerCase() === 'yes'
      ) {
        console.log(textToWrite);
      } else {
        console.log(
          'thank you, your file author-bookName.txt will be sent to books-found folder, goodbye...'
        );
      }
      return Promise.all([textToWrite, volInfo, fileCheck]);
    })
    .then(([textToWrite, volInfo]) => {
      return fsPromise.writeFile(
        `${__dirname}/books-found/${volInfo.authors}-${volInfo.title}.txt`,
        textToWrite,
        'utf-8'
      );
    })
    .catch((err) => {
      console.log('Error - No Book Found');
    });
};

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
        masterFunction();
      } else {
        console.log(`
        _______________________________________________
        Thank you, enjoy your book info!...Goodbye!...
        _______________________________________________`);
      }
    });
};

const searchByGenre = () => {
  let genreChosen = '';
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
        ]);
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
        ]);
      } else {
        return { genre: genre };
      }
    })
    .then(({ genre }) => {
      genreChosen = genre;
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}`
      );
    })
    .then((searchObject) => {
      const resultsArray = searchObject.data.items;
      return inquirer.prompt([
        {
          type: 'list',
          name: 'topGenre',
          message: `
Please choose one of the top results for ${genreChosen} --`,
          choices: [
            {
              name: `${resultsArray[0].volumeInfo.title} by ${resultsArray[0].volumeInfo.authors}`,
              value: resultsArray[0].id,
            },
            {
              name: `${resultsArray[1].volumeInfo.title} by ${resultsArray[1].volumeInfo.authors}`,
              value: resultsArray[1].id,
            },
            {
              name: `${resultsArray[2].volumeInfo.title} by ${resultsArray[2].volumeInfo.authors}`,
              value: resultsArray[2].id,
            },
            {
              name: `${resultsArray[3].volumeInfo.title} by ${resultsArray[3].volumeInfo.authors}`,
              value: resultsArray[3].id,
            },
            {
              name: `${resultsArray[4].volumeInfo.title} by ${resultsArray[4].volumeInfo.authors}`,
              value: resultsArray[4].id,
            },
          ],
        },
      ]);
    })
    .then(({ topGenre }) => {
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=:${topGenre}`
      );
    })
    .then((searchObject) => {
      const { title, authors, publisher, publishedDate, description } =
        searchObject.data.items[0].volumeInfo;
      const genreBook = `         
          Your Chosen book in ${genreChosen}:   
          Title: ${title}
          Authors: ${authors}`;
      console.log(genreBook);
      return searchObject;
    })
    .catch((err) => {
      console.log('Error - No Book Found');
    });
};

const topBooksByAuthor = () => {
  let authorChosen = '';
  return inquirer
    .prompt([
      {
        name: 'author',
        message: 'Please enter an author --',
      },
    ])
    .then(({ author }) => {
      authorChosen = author;
      console.log(
        `Good choice! Let's see if we can get ${author}'s top books, now processing, please wait...`
      );
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=inauthor:${author}`
      );
    })
    .then((searchObject) => {
      const resultsArray = searchObject.data.items;
      return inquirer.prompt([
        {
          type: 'list',
          name: 'authorsTopBooks',
          message: `
Please choose one of the top results for ${authorChosen} --`,
          choices: [
            {
              name: `${resultsArray[0].volumeInfo.title} by ${resultsArray[0].volumeInfo.authors}`,
              value: resultsArray[0].id,
            },
            {
              name: `${resultsArray[1].volumeInfo.title} by ${resultsArray[1].volumeInfo.authors}`,
              value: resultsArray[1].id,
            },
            {
              name: `${resultsArray[2].volumeInfo.title} by ${resultsArray[2].volumeInfo.authors}`,
              value: resultsArray[2].id,
            },
            {
              name: `${resultsArray[3].volumeInfo.title} by ${resultsArray[3].volumeInfo.authors}`,
              value: resultsArray[3].id,
            },
            {
              name: `${resultsArray[4].volumeInfo.title} by ${resultsArray[4].volumeInfo.authors}`,
              value: resultsArray[4].id,
            },
          ],
        },
      ]);
    })
    .then(({ authorsTopBooks }) => {
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=:${authorsTopBooks}`
      );
    })
    .catch((err) => console.log('Error - No Books Found'));
};

const topBooksByTitle = () => {
  let titleChosen = '';
  return inquirer
    .prompt([
      {
        name: 'title',
        message: 'Please enter a title --',
      },
    ])
    .then(({ title }) => {
      titleChosen = title;
      console.log(
        `Good choice! Let's see if we can get some matches to ${title}, now processing, please wait...`
      );
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${title}`
      );
    })
    .then((searchObject) => {
      const resultsArray = searchObject.data.items;
      return inquirer.prompt([
        {
          type: 'list',
          name: 'titleTopBooks',
          message: `
Please choose one of the top results for ${titleChosen} --`,
          choices: [
            {
              name: `${resultsArray[0].volumeInfo.title} by ${resultsArray[0].volumeInfo.authors}`,
              value: resultsArray[0].id,
            },
            {
              name: `${resultsArray[1].volumeInfo.title} by ${resultsArray[1].volumeInfo.authors}`,
              value: resultsArray[1].id,
            },
            {
              name: `${resultsArray[2].volumeInfo.title} by ${resultsArray[2].volumeInfo.authors}`,
              value: resultsArray[2].id,
            },
            {
              name: `${resultsArray[3].volumeInfo.title} by ${resultsArray[3].volumeInfo.authors}`,
              value: resultsArray[3].id,
            },
            {
              name: `${resultsArray[4].volumeInfo.title} by ${resultsArray[4].volumeInfo.authors}`,
              value: resultsArray[4].id,
            },
          ],
        },
      ]);
    })
    .then(({ titleTopBooks }) => {
      return axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=:${titleTopBooks}`
      );
    })
    .catch((err) => console.log('Error - No Books Found'));
};

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
        choices: [
          'Title & Author',
          'Genre',
          'Top Books By Author',
          'Top Books By Title',
        ],
      },
    ])
    .then(({ menu }) => {
      if (menu === 'Title & Author') {
        requestAnAuthorAndBook().then((searchObject) => {
          if (searchObject) {
            requestFurtherInfo(searchObject).then(() => {
              repeatSearch();
            });
          } else {
            repeatSearch();
          }
        });
      } else if (menu === 'Genre') {
        searchByGenre().then((searchObject) => {
          if (searchObject) {
            requestFurtherInfo(searchObject).then(() => {
              repeatSearch();
            });
          } else {
            repeatSearch();
          }
        });
      } else if (menu === 'Top Books By Author') {
        topBooksByAuthor().then((searchObject) => {
          if (searchObject) {
            requestFurtherInfo(searchObject).then(() => {
              repeatSearch();
            });
          } else {
            repeatSearch();
          }
        });
      } else if (menu === 'Top Books By Title') {
        topBooksByTitle().then((searchObject) => {
          if (searchObject) {
            requestFurtherInfo(searchObject).then(() => {
              repeatSearch();
            });
          } else {
            repeatSearch();
          }
        });
      }
    });
};

masterFunction();
