/**
 * Created by sarahcoletti on 2/17/16.
 */
import {Agency, Agencies} from '/model/agencies'
import {Visit, Visits } from '/model/visits'

Meteor.startup(function ()  {

  if (Meteor.users.find().count() === 0) {
    //create one admin user
    Accounts.createUser({
      username: 'Sarahc', email: 'sarahcoletti12@gmail.com', password: 'Visitry99',
      userData: {firstName: 'Sarah', lastName: 'Coletti', role: "visitor"}
    });

    var sarahc = Meteor.users.findOne({username: 'Sarahc'});
    //create the agencies
    if (Agencies.find().count() === 0) {
      var agency1 = new Agency(
        {
          name: "IVY Agency",
          description: "IVY Agency provides friendly visitor services to local area.",
          website: "http://visitry.org",
          location: {
            address: "80 Willow Street, Acton, MA 01720",
            formattedAddress: "80 Willow St, Acton, MA 01720",
            geo: {
              "type": "Point",
              "coordinates": [-71.477358, 42.468846]
            }
          },
          activeUntil: new Date(2020, 11, 31, 0, 0, 0, 0),
          administratorId: sarahc._id,
          contactEmail: 'sarahcoletti12@gmail.com',
          contactPhone: '978-264-4171',
          createdAt:new Date()
        });
      agency1.save();
      var agency2 = new Agency({
          name: "Test Pilot Senior Center",
          description: "For demo and test purposes",
          website: "http://ivy-solutions.org",
          location: {
            address: "Boston",
            formattedAddress: "Boston",
            geo: {
              "type": "Point",
              "coordinates": [-71.0589, 42.3601]
            }
          },
          activeUntil: new Date(2020, 11, 31, 0, 0, 0, 0),
          administratorId: sarahc._id,
          contactEmail: 'sarahcoletti12@gmail.com',
          contactPhone: '978-264-4171',
          createdAt:new Date()
        });
      agency2.save();
    }

    var agency = Agency.findOne({name:'IVY Agency'});
    //create a few test users
    Accounts.createUser({
      username: 'Vivian', email: 'viv@aol.com', password: 'Visitry99',
      userData: {
        firstName: 'Vivian',
        lastName: 'Visitor',
        role: "visitor",
        agencyIds: [agency._id],
        location: {
          address: "25 First St., Cambridge, MA",
          formattedAddress: "25 First St., Cambridge, MA",
          geo: {
            type: "Point",
            coordinates: [-71.078006,42.369707 ]
          }
        },
        visitRange: 10,
        about: "I am new to Boston having moved from Ohio. I am studying clarinet at Berklee. I enjoy reading fiction, taking walks, and learning about history.",
        picture: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBYRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAoKADAAQAAAABAAAAagAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAagCgAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwQDAwMEBQQEBAQFBwUFBQUFBwgHBwcHBwcICAgICAgICAoKCgoKCgsLCwsLDQ0NDQ0NDQ0NDf/bAEMBAgICAwMDBgMDBg0JBwkNDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDf/dAAQACv/aAAwDAQACEQMRAD8A/c8eXbMkMvyFzhCfusfQHpn279qnEbYqzLFFcRPBcRrJHINrKwyCD2INcrL/AGt4dzLCk2q6UD80S5kvbUeqd7iMf3T+9A+6X4Ud/P1Zg4I0r+0uZ4T9klENzH80UhGVDejr3RujDg45HIBFDSdU/tSOWOSP7Ne2jCO6tmOWicjIIPG5HHKOOGHoQQN2xv7HVLSO+06dLm3lGUkjOVOOCPYg8EHBB4IBrD1/Rrm4ki1jRHSHV7RSsRkyIriInLW82Mny2PKtgmNsMP4lalLqRKNi+6N3WqrxjutLoutWmvWRurdHhlidobm2mAE1tOmN8UgBxuGQQRkMpDKSpBOg0YNdEKpnKNzAkgQ84qk9uvaugkiHWqjwg9RXXCoc8oGJ5WKpzQKQeMmt1rcGqzW4raMzFxtscjNa+lZktoT0612stqDWfLaD0zXVCsc06Rw0tswzxWXNbNnOK76SzUjpWZNYE9BXXTxCOedBnCSQMOBWZPGyNiQEKeA3YH0PpXfSaew5IxVeSwVQfN5BH4Gt/rSMfq7ZxS6cznpn2rLn047mz0XqB2rr7iU6QvmMM2h/5adTD/vf7Hv/AA9+OR5vrXi+2tZbsggS23VSf9Ynt/tDqPWp+tte89i/q6eg6a1+bYqEcGsPWbC3ksZI51Uo6HO4ZBB9c1RuviJpkVkl3NInz5KBSOQO/wCNfO3xH+OVrb2UtlFv8xj+4/2g3X3x1Fc+IzujRhzykb0ssnUfKkf/0P3kpqnOfqad9ajgyQ+T0dq67mdjmNR8PTx3kmteG5UsdQlIadHBNpeY4xOg5D44EyfOOM71G2rWk65HqMj2F3C9hqUC7prOUgsF6eZGw+WWIno6/RgrZUdLWXqmk2WrxIl0GWSFt8E8TbJoJOm6NxypxwRyGHDAjIoTtsS43OW1/SL60vh4r8Ox+ZfxoI7y0BCrqNsmSE54E8eSYXPclGO1srv6ZqNjrWnw6pp0nm2867lbBVgQSGVlPKurAqykAqwIIyKrW+o3Wnzx6b4gZN0rBLa+QbIbhj0Rx0imP937rn7hz8gy9Rtn8L6hN4islLaddNv1a3UE+W+APtkajuAAJ1H3kG8fMp3Up2M3E6do89qgaAmr6NHIiyRsHRgGVlOVIPIII6gjoaaR6Vsqj6EuPcyWtjVd4D3raZRVV1UZzW0axm6aZjPAKqSQe1bTIhGc5qjOY4xl2wPeuiNVmUqdjFkh9qoyQ+1a/n28hIVgcehrIv8AUbS0jeR3A2DJHtWqqmTgZlw0UAJlYKAO9czLf2aF/ImRsAlombCH6H+E/pXgfxs+KjaXp7R6ZKjiVWI2N84Ud/avzX1X41/E61vHnsryYpkkqxDkRfwgjuTXnYvPaGHnyS1fkdFHA1Kiutj9ZNW8daDpkE0s0gECnEsUmPMhJ9R3RuxGVzxmvzW+LHxYig1q9tNCuUltTITEYzkxg/w+yDsP4f8AdxjwG7+IXxC8TqINavZZkjZzCVYIELdVPGQP9k5BrB+zLJumvU2SRynfIvYnGcjnKkd6+azbiKdRKFLRfienRyt0lz1Eblx488S6nI8tvIfs1wRyf+WW08qvpk1yetXWqX1w2oXrvcbWVYmZskHA+VRxwD1q3I0cO6O2O6BiTtHG3HcHB+X+X06b1hZLrEU0M0Uhjt7dW3QlXIzwXUdTt68ZOK+c+vVJz1e56NCMIqzP/9H93xPDtL712qMk56CvK7743/CPQ7o2mqeLdJgleRgqtdR9QQD0J71/Pyf2iP2k5DJbahreqX1o4McsYBhdoyMFSUXniucTV9Pu40a40UrCCQi/dkR+mGz/ADPWhYhP4NfRofLzan9JFx8Uvh1a20V5ceI9NSGb/VubmPDfTmuj0vxFoWuWrX2kX9veW6naZYZFdAfQkHFfzOC/slZdPls7ixVBubcSVOewOcYruvC/izWtK0y907QNZu7HTZnD3VvFOyiVxwOAQeR6VzVMyjTdmhOC2P6Kp7vQ9SjfTbia2uUuEKvCzK4dT1BXPNYa3dz4XkS21OZrjR5GCQX0rbpLUtwsVyx+8hPCTHnosnOHb+ebU9Z1aG5tdb0rxPNpDwSZjxK4kaRTkAEHgZ/A96+y9A/4KAa1Z+Eraz8UaQuo3JJtpZ40/czIPlJZST1HUdDW9PHU5q70ZjU0P1PtU/4Rq9TTDxpV2+LM9rWZuTbn0jc8xf3TmPpsFdOTjpXwt4W/aI0DVNLj0hb63vdHvIlEZ3M8tg0mNtvKc7vL3YEMh+ZDhSfuk+jaZ8Y9bikfStTjM1xbKCJhA+Z4OizYA65+WTHR+ejCvSp0nLZo5XiYLRn08xXHJxWVc39la4e6uIolwRl3Cjj6mvh3xT+1zHpHiE6PaxrcpGhLyiMbVb+78zD8a86179rnxHPDLDoskUMxjMqlYEIVe5znrXJWzDD0m05q67am9OnOesIs+2PEPxY8FaBM0c1/vcLu2QxSy5+mxGr5s8eftNaNe291Y6Et2CoKJKbaRQXHUfMq4xXw7rPxA+IfxB1QXVxfXDxxcefIhUFWOcAJ156V5/e6X4tv0RbWK+uINzsrPHIIy4Jyev8AWvHqcQzlpSjodlPKa002+nmv8z688CftS3OnXL/8JZFNJbrvA8tcuP7uQDnFP8S/tUeG5ZHmtoryUywyRyRlCgTdwDk8HFfAWpWmppeC1naJpiB8sO4qPQMQwGauQWWqWd7FavFBMI2UFGRyCxPI+U88/nXB/rBioQ5W1+p3/wBgv43F2+X+Z6TrHxFTXsLNut0RXxuDNI3oDxgZ7VwGpTWP2d7rTLYTSMMbgN+D2LD1+ldVNpPiG1mS6GixQqHDhC/llgDnbtcg/T2rp7K58LyTv/a/h7ULea5Pz/uY50jU5wy4Z9oGDzx0rzaVOdVuc2eg6sMOuVxX46fPU8gsfDniW4ha+h0udUkQOWAyHXHPy8E8/lSWeh6lNNs1IfYoHBO3YUO4dMMy9fxrvNf8a6bY+Ib2Dw/qVxFYw6NIyxuxO6eE52hJBKqkhj90qMCq/hPV7rWPC6z3ll/a0u0RtMk3l3aopZVfbuYOPlJJOznrXJGrGU7U1qnJa9eV2ff5HPHHQnKyVvkvL5nnWp6RbaOLq+sJ4rhCqxkkj+M87l6jp94dO/FRaTYX1/HcG3igQxxm5khyqzMF/ihycPjuuRnvz17vVvE+g6zpx0SWCEXdqQsRmRYp5AeoGTycdcEg1481peaH4jtppFvI9NmZUcoUSOBJDgOS4ZI9p5J4GOeK3pUk3zIzmorWD08uh//S5g+CrYZm1K0tlmjwwkY43g9cEYJrrE8LeG7aG3WS2j3TgIMZZmJGR1J4+td1aWGjXJtb+RopJIU2l5VKCFx6KRnmsrQYjfeKLr5xexKN0TI2FjAz8qnPT2rzJRjL4j11TS0OavvCekyB7a605biBYi5dSU2442ncSpx7YrxLXtP+HtuEt9CvGErRkSCAlgGHRSOPxODX1zaaZYeIoNRspJJr12VysGTDtQH5l+YDJ7g+9eGxfAfw3LcyX9zcXmm7WOy2WSNmfngZYACsJpx1ppGU6MXsjwW30bStWt5I44bu6e3HnK0e0ooB5LfdYfQKa2NJ8O6bfeXDNc+XGxEjW/Icc9NpwfxxXsenfDew8NCT7ZPc2sbMWUHZjOcqXK5wR1GTtP6Ul3YaZuUXzie2+/hsOrN6tgcH9K8vE157PQ4nh3e6/r+vmcvoulHwfftqPhmeRpZAUkWTmJkbqjIRh0I65Fd5P8XPirIsenXPiCWGOCN47abaPMj3pt8vzMbsEY+8SGwM/MATwep32madcuthJLAfKHlIJPPUnvuDnKr/ALp4qhd65DaW8l7dxwL56hDE0m6PoMtg/MMdcjoa5Pr9eCs20v67FrCp7/1+pasNOn1W6Gp6pvuZGJZkDldzoed3Pc16Fp+malHZrPNY28MAZmSQHzZPm6Kqjkgj8K53wp4e1nXbu2jsLu3CXjFUUyZLFQT0HcqMZHXj3x79ovhnwt4W0+XV9dvpG+zQlnR5PlO3OGC8ZPYY61VBe66ikrd76HpUFBR5ZLVbnCWXii/8GI73MKXli7qyIyHdCp/ADGOgzxXLeIPiT4h8W+Vokby2dnLPJFHPar5ex1BxG5GSm44zkc0eP9Q8M6Vqd80Mj61a39nBNb3DzEJA86syxCPHXaAy5wRznivI9H1jUk0+7tbWaIrqNvd6zby+UMxTRp84DEE/Lj8DXJiM1lTrOindWW3e9mvldNlVansmpRWr/P8Apoy7O9uvIt74wOpvL5LITuC8a3Ej4JPOGIz2r7isIvBvw48NpPfzbpBLAkreaN5edwgcDkhVY8gdK/Pe38f2cD+FtMeD7TjVItRuij7mVY1jYrsOVAbrn1Br0rTtVtvFs2r3YxLbyXe6C2lf5linmABUg4x5qnbj39azwmaU/ZKry2b6v7tfK90vJGdDMZ4iHLzaK2l9P6ue4638S9InttYl1eMRT6XJd26zPK7xCUELbnOcbXPBzxnrXhGveOrmz+LPh/WrS9kh0rVIrJGaImJVt2b94sm0gB1k3gnI4rm9E12y8Q2Xi9NUeMWU07SXFpJCwuIQwK7zk8qjPzgHoDmuc8QpPYRXcT3Ct/ZNneC2UhcKuVaI7sfNmWbIXOMZrycRxC44pYSU3zNP/gbLezu/TzM69b2EE5b6/wDA+89A+O1x4fg8a6vN9oZ3TTniie4w7SyrsVtjkAsFB4Oc4Peuf1DTr7w14d8LWaT51zUmNzbaXIEkC2rBmkkkDrlA5AVVEqkkE44Brwn4geKJf7c0mWyJ1SIWcLsg+dxMqKkgBcEgeauRjjGMcYrZsNQv7GG88VeLLy8l8TRRW1/A6z7zHalxtTcw3bxjqpwMgY713ZdR9hBTqP35ubSfXmlzP5JWscHOvauUY6v9df8Ahj1aee7sJDd+ONEv47C6h8vzoYBdwoR935ZvMXarDPySA44GKg8N6gtzDqVh4d1mDUNPayljntb1HhYxEbTsVtznGflB4H41D498b+FLO7j0u0vtVdtSjmim82cxxAhAyGRRjeH3bTnI4Ncd8JLm1ufHGo6bagLHLZzRozfxhFRgM9M4Xp7V62Jx31RXa1Vn+n5rVHVOMqU+aW/4/gf/0/VU8DaPd6wNZvr9vtez97GtyY45P9loz/TFYI8Ja/aaZc3XgyfT7aHzXQyNOXUiNiGQYxtIORxXzd4/sfDng6cbLSHT9W0may1W5WKeSaaWxld4plRpD8zKOSNo7H1ry7/hZN7pHiLVLey1KebStRt7ltPYk4AuJjJC+3ICMd7E5Ga+aq5nSp1VSl569NNT1nJ83K18z7F0a0/tbUYrG4nV9TWJrgQW10yQSRIwV234LEZOGG7jPSqnxR+J+j6dp09hpzJPPY2jyyxW7bo4cYUHzT8xYZ5HbjNfIlj4yvtL1SxuJ5WSSOZnkty21At6n74LjGFZ4w2M9a5zxTqGoPqLWcMKiS6tVIjVcExXbFkV/wC8wXbyeSAB2ryK3EFOpD93vrf0Xb5mdGvCacu252/gjxR4o8Tah9htru5ml2W5dFkz5hlZgqkHJ+7noCcCvShdeIvC+tXGg21patJJIkJhdUkkikEXncLNyRsBJOMZ4r5r0bUdR0qaRvBqTQalf7YUki+YiMQyRHC4JU5JO7Py9eOtesWl6uoeI28R+Kr6C9vNMsLRH+zDfsEUSxeZIVxvdsHO085zv7VxVsXGjhY1m9fXu7fm/uOujgaioRq1Gnv11079tX+B1Gn3E2s6C1/c6dbvdu0TL5cK5kgnyVcbCu0jHzZ+Ud67mCTwHrIi03xTCqSxRvNBb27KmxN3IeVf9aSOAoPbqK8YvvEl1c21ho2lCN4LqV7KGOFWESxRokjEE9WUuBliSOTWVqc66DcWlzfEr/oUDwbgVk+QggNuz824jkcFWr5ytntWFSNN7yjZRerbvppbZ6+ej22N6VOkqUZSad+z9LafP/gHvXjrxZ4Z057eDwkkVlHbQQ6iZrXGMp8sqHBJDIGDdmGDx6+efEPxzrmt+G7N5pVkgs7NY7aWNQJgXxvW4PUkFQUz1HTiuF1TWrC28RXsKqskNjeLFcxkZJineRZFI7/IR0rK1y8nsLi4vogl7Y36eXdxSN+8CZ3KcDug6NjAHp0rnp4+VaoqWITbnZuL1WykrX8rP10FGEcRJU39pPTt10/PyZ0Fpez3nihdPvJBbWFwbS3afnZCJ40geUAkbmRZtwDHg9MZr9Kfh/8As4/Buw0TTLK9ludbQQXEJv1nkhWb7WuyQCNGIRSAGAzw2eecV+Zmt2N9rGivqmiyCCSwsk1B4pI2V5LZDbw7h7houTjAOecc1z3g74h/E3wZfWM/hXxBNphu5Ps4huH3WmZP3q742DoNxcDdjjjtXZHEYuvh5yw8YxlFy5U9rX2v3+Rlg8PLETqRtdQTlpba6/H/ACP3GF38A/g3o6af/ZOi+HrC0t2v5FkhVise4xSSSZBZlGSvOeuAOa/Fv4o/G3QvF/xqvfFWjWdtougpfwW1va6fEI0+xWzjZJtjADSSZaRsDG5sDgCvOPix8Z/iP8QNbmm8YPHBO9idOuEjXAaIMsh9QNzqCccHtwau+GfBq6h4H1PxwY1kbTLKOOWRhndJLPapGOQRwnmDsazyTCZlWwk55pUT507RT0SSvutLvXX07awqlCtN0cKraWbfXb/I67xxq8Xg7Vhdaey31pc2h+1BsqshnUK4OMNhSisM/lg15ZpWo3/iXTLfSGd5IpbuK2lO7looQ2wEnnC7lH4DNd/4jtLbUpbK3umLtcafEZV7q44+b0JQhvpz3rymw16y8GGzjMBlks7q7nm+bBkG2NVTGMjay5z71viMLTU62Hw0bzS5o92uW8b+aelzzMzoOlXtF+61+Fl/X3nJtq+lw+KJIrmGRdOnuCqwQOVljiQbtqMQR90lR37/AF7K5mn1m/1rW9H+fTtNsoNOih3iYsWUSJGXAAYx7Muf73HPJrz+xt73xFeXl1ZqsV1LN58eckojsMkemP5V9CeCbfTrLwZ4p+w7Td/b7bUfJYfIUlhZcj2Lggjtmvpc0q06GB+stc04WX32XyO6lhHLCqs1/wAPt+D1+48v8R6c+p2ba22HdC2Y/wC8siNg+xGBiuy+EuqLL4J1PUYpvs9xZaxHtkUZKiWHBORk4+Qgj0JrlL/XpLG4+xxxB7OdfnUjmPDhgQfUcgjpitvwKbXw94Q8SQRvuC39pMOAOGY4H4A4rjzvEU8Xgea2rUX+OqHi7SlGvsmk399j/9T4Y13xFJ4yRvEN1PJNcxabtkkZiWZf9SqvkknAwd3ck1zWixKum3Nyfmezs1lSNwBnzXO04P3h8nAHOMnoKyodWtNM0m7slt5o7e6CRM6ukjLtbeOWQNglcY3Y4rUurX+0bi38PaASs9vD58xaP5SkcWDI8ysyiNTvYsxCgNivzSrRnVrz9nJOLd192z9Xv6m2IxE1aMVf+mS67eXGtTNq3lNBAmnySlzwGEbNCpH+8xGPc1s6w9lK93rGqyT2OlzQxwWcSD/TZbeBEjjZUbHlhlUfO5A54DdK3tf1jR/D2mx6T4bhj1HU/sVpA1xcqqJaNBGrHyLeXDSO0hJ8xwQDjanRq891jSrqHRl1CaeaS5ILXPn5lZ5Lg7C5JPbOD64rKj7ClGlSndLmsvm3b+vOx62WYOnVqU6cZcsr317ytb5dSwmv3V1p7aX4egj0y08tXkgRt0868MDNM3+tyoztG1AeiCuu8C6yv2q+1IA5ntktmjxkF0ZWVsfgRj0rzrwr4d1e50mC8tra4fyJXEssERk56BSQVHzJ6n14NdppFl9j03UpHUx31tfW7OeUZUlBxlf4SDnIx1FcHEtWk6MqSW/u+l2k7Lor216Pby9Oo4qiqNKFr6Su9buy07L1e9z0nwo1/qLCZgR5Vzq14NoziSSHDZxwPuL04ri/ibcJdDRNUgF1Ppyx/Y5VddsrNAMSSBRu24KAr1wo5rqtO8bvo8d29hcvZXc9vOjmPjInQIwYdCpdVDA9jXB6R450240bTLLUZ1ku7G6kunEyujvkEpGzA7SSQFY7wMHnvXyeSUMbiMS8XThdpxT25lG01dd91e2v3s87LMPOvzvCxvyJaWu0r2b+XV2NXxFHZReOLLV7pvscGsQpJJHIMKrSwGSIP0yTvXjvnFVjcS2/iKG3Iaa2gRrGRmXgXEZZ9rDsGzs56jHbFJ4q1N/G02r+KNWsZLcynzo7FOHjD8+WCQMIpVUBxwoyK53wj4tuYjca1dQyXK2kMS6wVQOAJGIikwOjhuOeucV7rpYicauIpw55RThy7WaaatbrZ2fmkttV9BgcGoz9vUtayTS0aemtut0ve9Sh/burWcU1qZWb7HNcJAWYsywSs26PJJJXJPH+0aoX+tXcuhpaycpgTE45VzwOfovFdPeRWGt+NJbfSkVINQvFEMaMX2pcYOOQDwSe2Rj8a6TWdA0WKxS2MAhSK7WIO5JUxN8rMzddu4E+3aprZpRhVj7Ze9Jp26+uvn+p5+ax+rYmrUhLlU0rpdXp/wABv1MLxZoOl6r8NND8c2N9FJqV1IbG+ssYnilj6PjPKSDBVuh5HVTXUP4ybw74E0b4UxQi0GvXNtfa/cMCZlt7ZvKt40H8IYK0zHGSGQDvni4bG1sJNL0i+lY77tVtmQ7o7iOOZtpXj5gWLAHt39oNSsZ7rxLrWtXW6b7M0uBks8kjb1A/DAI+mPSu/KaNR0KkabaTcoxT8/N9mvlfy18PC4apKLnSVm/d9dLv8j0DZZW+vXVnLKS7RRLbbzuZyAQRnv8AIuSfQV4l4406I3U19HI/2pJUkWLaPL8kg7m3Zzu3jBGMY5zXqOhGefxJoN5dsGivIWWN8c5MciFSP7wLYNdVYeE3i8WaJqcirKsOqrC6SAMjxSDAypBBw3XPanSlLD5xPFS25Em3sm/87W9Wd2JftK93pbS/a9n/AJnkPwlsY7jxDfXD4SU2h8hTyrozqW/4EFGDVKz1m607X4YmIEE9u9swAxw2cZ9cMa9c8NaVYeH/ABFd2DxrHLPHdeWvGIpPOZcDHIGwggVynxP8DW/hSfT5LO4+0MYVkkbsCetermUlXjK/wyuvwX66+pli5JYe9J6X/r8TzbUpUSeVJhhiCB/OtLRrW6tfD99rAlZY7xBC0fB3hcc/TgVyXiWVL26hW3c+bKwO0DPDDB5+vavoHV9MsdK8AQ2ap++8kZPuRW2V4OnUoXrLS23o9PyJwlH2tJyqfZX+dj//1fgl/wC14Glj1aOz06MR7ijwJLJngqRDGGbGCfvBee9Zo8d3smnxaXp1o19DNIIT58UdvBO0bkjMCBmbDOSBvwDzjOa8fu7i4WSOdZHEjwKzOGO5j6k9Sa9FubieTU/DqySOwWzsMBmJxuXc2PqTk+pr83p01SWnkb4ScZTa5f6udRqeteNr7zdYstNtp7TzJolni0mKbEsO1ADM8T4yckDdkhfSvQPEfiGw0FdOu9LbXLq9MMZuLyJorCL5hny0C2xO8EhTuGBjoTzS/tN3Fxp/w6+Emk2Ej21i1reTm2hYxwmXzEG8xrhd/J+bGea5v4yTz2HiO4hsJHto1m4SFjGozjOAuBSx9FUqkHZPmdtulrn1eVSpVasXVjdXWl7K2hp6D8RZLrXV/tnTb+KMwbY4Li9kWV2Cl1YP5arvY8AqgzwKral4o0PxROt3FcfZpb+ERXXnsMv5bZSQsBklSCG3KxxzntWr8Jbm41nTp4tYle+S3+zLEtyxmWMAuQFDkhRnnil/aL0bR9H+KktppNjbWUA8giO2hSJMvFljtQAfMeT615GJp06mKacVa23p/wAMvSws2qSp1eeO3bV/jc8Zv2nh8RLp107+U0gXzlkDxyqw+ZVdAMgsOMgHHXkUX2iiI21yRF5dwTGWjJXG/Bj37uCR0PQZ71xmis39oJHk7Fuzhew/eDoK9AnJPh2UE8Dy8fk1eljW8DOnToJK7s9PTbt+R1ZfKnSl7WjHlkr639H62308zXt5buxt00m4ZntpU+Qvy8bgn5QR/DkYx2qz4RsoE16/0poUFvqqssMigKZZG2yxwSY4ILgqhPR8Zo1b/U2D/wARdTnvzsP86sXAC6WjKMEK5BHUFXOPy7V8vmOaYiUE+azmrO2mqej8369NDTC5nVjjObTVP+n36r0OgjtYfB3ibw/q9zErxhiZgfvCSINGMnqCmclexGDW/f3Ok61ZaraW90Jbu3s1eWEA4hVXBjOccs29ycdBiuAldpPBulSSEs7anqZLMckk3EpPPuaj8M5PirxAp6Np1tkevyjrXg4qnze1qzd5QUop+Ua2n5nzuZ1XJNPs/wD0pHgEep6i3iG1U3YiXTJ2kt/NdvKi2SNKVXqRvfOB3Y+9fWN1AkPhb+2Uys1zrFx5m04JCqVUZ9icivkidVHmkAAksTx1OTzX1HaO7/C6EuxY/wBqvyTntHX2vFmJklg+XT95H57/AK6mixDdSEOl1/6UvzMmzN34Y0/Q5nzMNNvRd5PJ2MwZ1/Hk19B6T4dPiBbnVYbnZbWLC7QqfvY5HNeL6yP+JUn+4P5V7r8Lif8AhXGpHv8AZm/lXm0sZPFUZ1Z6Nzs7dVf+vvPOxlTmqYhW2f6/8E8Fv7nzfHLXR482MkAH8K5zxHrj6lJ9luCWMI2c+gqWFifFMGST8r/zrmNc41ibH96vpJe9g3F9LNHHSm3gfNO5y+hwXttrLx3ZWO1uZo0SNgCZAjZDDPIAJOPU19L/ABBtEh0O3jA4cKOe/FfOcCq3j7S0YAr9oXg8jvX0p8UyRb2qjp5fTt0rtrylGjJx0ul/kfR0pOnhZpeX5H//2Q=="
      }
    });
    Accounts.createUser({
      username: 'requester1', email: 'rq1@gmail.com', password: 'Visitry99',
      userData: {
        firstName: 'Raoul',
        lastName: 'Robbins',
        role: "requester",
        agencyIds: [agency._id],
        about: "I watch baseball - Red Sox games. I grow orchids. I was a mechanic in the Army Air Corps and worked in the post office.",
        picture: "data:image/jpeg;base64,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"
      }
    });
    Accounts.createUser({
      username: 'requester2', email: 'rq2@gmail.com', password: 'Visitry99', role: "requester",
      userData: {
        firstName: 'Rita',
        lastName: 'Smith',
        role: "requester",
        agencyIds: [agency._id],
        about: "6 grandchildren - 4 girls and 2 boys. Born in Naples Italy. I enjoy walking and used to go hiking in the White Mountains."
      }
    });
    Accounts.createUser({
      username: 'requester3', email: 'rq3@gmail.com', password: 'Visitry99',
      userData: {
        firstName: 'Ron',
        lastName: 'Wang',
        role: "requester",
        agencyIds: [agency._id],
        about: "I sing in the choir. I have four cats.",
        picture: "data:image/jpeg;base64,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"
      }
    });
    //set one user to access all agencies
    let allAgencies = Agencies.find();
    let allAgencyIds = allAgencies.map( function(agency) { return agency._id});
    Meteor.users.update(sarahc._id, {$set: {'userData.agencyIds': allAgencyIds}});
  }

  if(Visits.find().count() ===0){
    var agency = Agency.findOne({name:'IVY Agency'});
    var vivian = Meteor.users.findOne({username:'Vivian'});
    var requester1 = Meteor.users.findOne({username:'requester1'});
    var requester2 = Meteor.users.findOne({username:'requester2'});
    var requester3 = Meteor.users.findOne({username:'requester3'});

    var now = new Date();
    var futureMonth, pastMonth;
    if (now.getMonth() == 11) {
      futureMonth = new Date(now.getFullYear() + 1, 0, 1);
    } else {
      futureMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    if (now.getMonth() == 0) {
      pastMonth = new Date(now.getFullYear() - 1, 0, 1);
    } else {
      pastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }
    var futureSuburbanVisitRequest = new Visit({
      "requesterId":requester1._id,
      "agencyId": agency._id,
      "createdAt":pastMonth,
      "visitorId": vivian._id,
      "requestedDate": new Date(futureMonth.getFullYear(),futureMonth.getMonth(),1,13,0,0,0),
      "visitTime": new Date(futureMonth.getFullYear(),futureMonth.getMonth(),1,13,0,0,0),
      "notes": '1pm works best',
      "location": {
        "address":"36 Charter Rd, Acton, MA 01720",
        "formattedAddress":"36 Charter Rd, Acton, MA 01720",
        "geo": { "type": "Point",
          "coordinates": [-71.458239, 42.479591]
        }
      }
    });
    futureSuburbanVisitRequest.save();

    var futureScheduledVisit = new Visit ({
      "requesterId":requester1._id,
      "agencyId": agency._id,
      "visitorId": vivian._id,
      "createdAt":new Date(),
      "requestedDate": new Date(futureMonth.getFullYear(),futureMonth.getMonth(),15,16,0,0,0),
      "visitTime": new Date(futureMonth.getFullYear(),futureMonth.getMonth(),15,15,15,0,0),
      "notes": '3pm works best',
      "location": {
        "address": "Walden Pnd",
        "formattedAddress": "Walden Pnd",
        "geo": {
          "type": "Point",
          "coordinates": [-71.338848, 42.437465]
        }
      }
    });
    futureScheduledVisit.save();

    var pastVisitNoFeedback = new Visit({
      "requesterId": requester1._id,
      "agencyId": agency._id,
      "visitorId": vivian._id,
      "createdAt":pastMonth,
      "requestedDate": new Date(pastMonth.getFullYear(),pastMonth.getMonth(),21,9,0,0,0),
      "visitTime": new Date(pastMonth.getFullYear(),pastMonth.getMonth(), 21, 13, 30, 0, 0),
      "notes": '10pm works best',
      "location": {
        "address":"Boston",
        "formattedAddress":"Boston",
        "geo": { "type": "Point",
          "coordinates": [-71.0589, 42.3601]
        }
      }
    });
    pastVisitNoFeedback.save();

    var futureMidDistanceRequest = new Visit({
      "requesterId": requester2._id,
      "agencyId": agency._id,
      "createdAt":new Date(pastMonth.getFullYear(),pastMonth.getMonth(), 21, 13, 30, 0, 0),
      "requestedDate": new Date(futureMonth.getFullYear(),futureMonth.getMonth(),29,9,0,0,0),
      "notes": 'pick me, please',
      "location": {
        "address":"Belmont, MA",
        "formattedAddress":"Belmont",
        "geo": { "type": "Point",
          "coordinates": [-71.176972, 42.396341]
        }
      }
    });
    futureMidDistanceRequest.save();

    var futureLocalRequest = new Visit({
      "requesterId": requester1._id,
      "agencyId": agency._id,
      "createdAt":new Date(),
      "requestedDate": new Date(futureMonth.getFullYear(),futureMonth.getMonth(),15,13,0,0,0),
      "notes": 'Shall we go for coffee?',
      "location": {
        "address":"Boston Public Garden",
        "formattedAddress": "Boston Public Garden",
        "geo": { "type": "Point",
          "coordinates": [-71.069459, 42.35621]
        }
      }
    });
    futureLocalRequest.save();

    var pastVisitNoFeedback2 = new Visit({
      "requesterId":requester1._id,
      "agencyId": agency._id,
      "visitorId": vivian._id,
      "createdAt":pastMonth,
      "requestedDate": new Date(pastMonth.getFullYear(),pastMonth.getMonth(),2,13,0,0,0),
      "visitTime": new Date(pastMonth.getFullYear(),pastMonth.getMonth(),2,13,0,0,0),
      "notes": 'This already happened',
      "location": {
        "address":"Boston",
        "formattedAddress":"Boston",
        "geo": { "type": "Point",
          "coordinates": [-71.0589, 42.3601]
        }
      }
    });
    pastVisitNoFeedback2.save();

    var futureNearbyRequest = new Visit({
      "requesterId": requester2._id,
      "agencyId": agency._id,
      "createdAt":new Date(pastMonth.getFullYear(),pastMonth.getMonth(), 22, 13, 30, 0, 0),
      "requestedDate": new Date(futureMonth.getFullYear(),futureMonth.getMonth(),17,9,0,0,0),
      "notes": 'I need to walk Bowser.',
      "location": {
        "address":"Riverside, Cambridge, MA",
        "formattedAddress":"Riverside",
        "geo": { "type": "Point",
          "coordinates": [-71.111397, 42.368699]
        }
      }
    });
    futureNearbyRequest.save();
  }

});