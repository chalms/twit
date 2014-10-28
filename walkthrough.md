### Node.JS and Mocha 

The following is an introduction to using test cases with 'Mocha' to test a  Node.js server. This is an example of building a website server that serves tweets and stores them into a users collection in a Mongo.DB database. The server will use socket.io to asyncronously communicate with the client webpage, and to display tweets in real-time. 

```javascript
    var assert = require("assert"); // node.js core module

    describe('Array', function(){
      describe('#indexOf()', function(){
        it('should return -1 when the value is not present', function(){
          assert.equal(-1, [1,2,3].indexOf(4)); // 4 is not present in this array so indexOf returns -1
        })
      })
    });
```