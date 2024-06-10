// Spis tokenów
const TOKEN_TYPES = {
    PLUS: '+',
    MINUS: '-',
    MUL: '*',
    DIV: '/',
    MOD: '%',
    EXP: '^',
    EQUALS: '=',
    NEQUALS: '!=',
    GREATER: '>',
    LESSER: '<',
    NGREATER: '<=',
    NLESSER: '>=',
    ABS: '||',
    SIN: 'sin',
    COS: 'cos',
    EXPONENTIAL: 'exp',
    LN: 'ln',
    PI: 'pi',
    EULER: 'e',
    LPAREN: '(',
    RPAREN: ')',
    INTEGER: 'integer',
    FLOAT: 'float',
    IDENTIFIER: 'identifier',
    EOF: 'eof',
  };
  
  // Klasa tokena
  class Token {
    constructor(type, value) {
      this.type = type;
      this.value = value;
    }
  }
  
  // Analizator leksykalny (tokenizator)
  class Tokenizer {
    constructor(input) {
      this.input = input;
      this.position = 0;
    }
  
    getNextToken() {
      if (this.position >= this.input.length) {
        return new Token(TOKEN_TYPES.EOF, null);
      }
  
      const currentChar = this.input[this.position];
  
      if (/\d/.test(currentChar)) {
        return this.parseNumber();
      } else if (/[a-zA-Z]/.test(currentChar)) {
        return this.parseIdentifier();
      } else if (/\s/.test(currentChar)) {
        this.position++;
        return this.getNextToken();
      } else {
        return this.parseOperator();
      }
    }
  
    parseNumber() {
      let number = '';
  
      while (/\d|\./.test(this.input[this.position])) {
        number += this.input[this.position];
        this.position++;
      }
  
      if (number.includes('.')) {
        return new Token(TOKEN_TYPES.FLOAT, parseFloat(number));
      } else {
        return new Token(TOKEN_TYPES.INTEGER, parseInt(number));
      }
    }
  
    parseIdentifier() {
      let identifier = '';
  
      while (/[a-zA-Z]/.test(this.input[this.position])) {
        identifier += this.input[this.position];
        this.position++;
      }
  
      if (identifier.toLowerCase() === 'pi') {
        return new Token(TOKEN_TYPES.PI, Math.PI);
      } else if (identifier.toLowerCase() === 'e') {
        return new Token(TOKEN_TYPES.EULER, Math.E);
      } else {
        return new Token(TOKEN_TYPES.IDENTIFIER, identifier);
      }
    }
  
    parseOperator() {
      const currentChar = this.input[this.position];
      let operatorType;
  
      switch (currentChar) {
        case '+':
          operatorType = TOKEN_TYPES.PLUS;
          break;
        case '-':
          operatorType = TOKEN_TYPES.MINUS;
          break;
        case '*':
          operatorType = TOKEN_TYPES.MUL;
          break;
        case '/':
          operatorType = TOKEN_TYPES.DIV;
          break;
        case '%':
          operatorType = TOKEN_TYPES.MOD;
          break;
        case '^':
          operatorType = TOKEN_TYPES.EXP;
          break;
        case '(':
          operatorType = TOKEN_TYPES.LPAREN;
          break;
        case ')':
          operatorType = TOKEN_TYPES.RPAREN;
          break;
        default:
          throw new Error(`Unknown operator: ${currentChar}`);
      }
  
      this.position++;
      return new Token(operatorType, currentChar);
    }
  }
  
  // Klasa analizatora składniowego
  class Parser {
    constructor(input) {
      this.tokenizer = new Tokenizer(input);
      this.currentToken = this.tokenizer.getNextToken();
    }
  
    eat(expectedType) {
      if (this.currentToken.type === expectedType) {
        this.currentToken = this.tokenizer.getNextToken();
      } else {
        throw new Error(`Unexpected token: ${this.currentToken.type}, expected: ${expectedType}`);
      }
    }
  
    factor() {
      const currentToken = this.currentToken;
  
      if (currentToken.type === TOKEN_TYPES.INTEGER || currentToken.type === TOKEN_TYPES.FLOAT) {
        this.eat(currentToken.type);
        return currentToken.value;
      } else if (currentToken.type === TOKEN_TYPES.IDENTIFIER) {
        const functionName = currentToken.value;
        this.eat(TOKEN_TYPES.IDENTIFIER); // Eat the function name
        this.eat(TOKEN_TYPES.LPAREN); // Eat the left parenthesis
        const expressionValue = this.expression();
        this.eat(TOKEN_TYPES.RPAREN); // Eat the right parenthesis
  
        // Calculate function value based on the function name
        switch (functionName.toLowerCase()) {
          case 'sin':
            return Math.sin(expressionValue);
          case 'cos':
            return Math.cos(expressionValue);
          case 'exp':
            return Math.exp(expressionValue);
          case 'ln':
            return Math.log(expressionValue);
          default:
            throw new Error(`Unknown function: ${functionName}`);
        }
      } else if (currentToken.type === TOKEN_TYPES.LPAREN) {
        this.eat(TOKEN_TYPES.LPAREN); // Eat the left parenthesis
        const expressionValue = this.expression();
        this.eat(TOKEN_TYPES.RPAREN); // Eat the right parenthesis
        return expressionValue;
      } else if (currentToken.type === TOKEN_TYPES.MINUS) {
        this.eat(TOKEN_TYPES.MINUS); // Eat the minus sign
        return -this.factor();
      } else {
        throw new Error(`Unexpected token: ${currentToken.type}`);
      }
    }
  
    term() {
      let result = this.factor();
  
      while ([TOKEN_TYPES.MUL, TOKEN_TYPES.DIV, TOKEN_TYPES.MOD].includes(this.currentToken.type)) {
        const currentToken = this.currentToken;
  
        if (currentToken.type === TOKEN_TYPES.MUL) {
          this.eat(TOKEN_TYPES.MUL); // Eat the multiplication sign
          result *= this.factor();
        } else if (currentToken.type === TOKEN_TYPES.DIV) {
          this.eat(TOKEN_TYPES.DIV); // Eat the division sign
          result /= this.factor();
        } else if (currentToken.type === TOKEN_TYPES.MOD) {
          this.eat(TOKEN_TYPES.MOD); // Eat the modulo sign
          result %= this.factor();
        }
      }
  
      return result;
    }
  
    expression() {
      let result = this.term();
  
      while ([TOKEN_TYPES.PLUS, TOKEN_TYPES.MINUS].includes(this.currentToken.type)) {
        const currentToken = this.currentToken;
  
        if (currentToken.type === TOKEN_TYPES.PLUS) {
          this.eat(TOKEN_TYPES.PLUS); // Eat the plus sign
          result += this.term();
        } else if (currentToken.type === TOKEN_TYPES.MINUS) {
          this.eat(TOKEN_TYPES.MINUS); // Eat the minus sign
          result -= this.term();
        }
      }
  
      return result;
    }
  
    parse() {
      return this.expression();
    }
  }

  // Funkcja główna programu
function main(input) {
    const parser = new Parser(input);
    const simplifiedExpression = simplifyExpression(parser);
    return simplifiedExpression;
}

function calculate() {
    const inputField = document.getElementById('Field');
    const resultDiv = document.getElementById('result');

    const inputExpression = inputField.value;
    const simplifiedExpression = main(inputExpression);
    resultDiv.textContent = 'Wynik: ' + simplifiedExpression;
}
  
/*
// Nasłuchiwanie zdarzenia wciśnięcia klawisza w polu tekstowym
document.getElementById('Field').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Zapobiegamy domyśl

        calculate(); // Wywołujemy funkcję obliczającą wynik
    }
});

*/
  // Przykładowe użycie
  /*const inputExpression = 'sin(pi/2) + ln(exp(1))';
  const parser = new Parser(inputExpression);
  const result = parser.parse();
  console.log('Wynik: ', result);
*/