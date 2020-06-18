import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import conversionMap from './data/decimal-rateMap-info.json';
import { numToCurString } from './util';

class App extends Component {
  state = {
    ...conversionMap,
    fromCurrency: "",
    fromAmount: "",
    toCurrency: "",
    toAmount: ""
  }

  //for input to conform to numeric format
  controlNumericInput(inputString) {
    let tempFromAmount = inputString;
    tempFromAmount = tempFromAmount.replace(/[^\d.]/g, "");
    if (this.state.decimalsForCurrencies[this.state.fromCurrency] === 0) {
      tempFromAmount = tempFromAmount.replace(/\.(.)*/, "");  //RegExp translation: dot then anything
      tempFromAmount = tempFromAmount.replace(/^(0)+/, ""); //RegExp translation: one or more 0 at the beginning
    } else {
      tempFromAmount = tempFromAmount.replace(/^0(?=\d)/, "");  //RegExp translation: 0 followed by any digit
      tempFromAmount = tempFromAmount.replace(/^\./, "0.");
      tempFromAmount = tempFromAmount.replace(/(?<=\.(\d)*)\./g, ""); //RegExp translation: dots, which are preceded by a dot then any number of digits
      tempFromAmount = tempFromAmount.replace(new RegExp(
        `(?<=\\.(\\d){${
        this.state.decimalsForCurrencies[this.state.fromCurrency]
        },${
        this.state.decimalsForCurrencies[this.state.fromCurrency]
        }}).`,
        "g"
      ), ""); //RegExp translation: anything, which is preceded by a dot then as many digits as allowed by currency
    }
    this.setState({ fromAmount: tempFromAmount }, this.updateToAmount);
  }

  //To keep result updated
  updateToAmount() {
    let tempToAmount = Number.parseFloat(this.state.fromAmount);
    let tempFromCurrency = this.state.fromCurrency;
    let rate = this.state.conversionRates[tempFromCurrency][this.state.toCurrency];
    if (this.state.fromCurrency === "" || this.state.fromAmount === "" || this.state.toCurrency === "") {
      this.setState({ toAmount: "" });
    } else {
      if (this.state.conversionRates[this.state.fromCurrency][this.state.toCurrency] === -1) {
        this.setState({ toAmount: `Unable to find rate for ${this.state.fromCurrency}/${this.state.toCurrency}` });
      } else {
        while (isNaN(rate)) {
          tempToAmount *= this.state.conversionRates[tempFromCurrency][rate];
          tempFromCurrency = rate;
          rate = this.state.conversionRates[tempFromCurrency][this.state.toCurrency];
        }
        tempToAmount *= rate;
        this.setState({ toAmount: numToCurString(tempToAmount, this.state.decimalsForCurrencies[this.state.toCurrency]) });
      }
    }
  }

  //To handle all changes in the form
  formChangeHandler(e) {
    switch (e.target.name) {
      case "from-currency":
        this.setState({ fromCurrency: e.target.value }, () => { this.controlNumericInput(this.state.fromAmount.slice(0)); });
        break;
      case "from-amount":
        this.controlNumericInput(e.target.value);
        break;
      case "to-currency":
        this.setState({ toCurrency: e.target.value }, this.updateToAmount);
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <Col style={{ textAlign: "center" }}>
            <h2>Currency Converter</h2>
          </Col>
        </Row>
        <Form>
          <Row>
            <Col xs="12"
              md="6"
              style={{ textAlign: "center" }}
            >
              <h4>
                <strong>From:</strong>
              </h4>
            </Col>
          </Row>
          <Form.Group as={Row}>
            <Col xs="12"
              md={{ span: 5, offset: 1 }}
              lg={{ span: 3, offset: 3 }}
            >
              <Form.Control as="select"
                name="from-currency"
                style={{ textAlign: "center", width: "100%" }}
                value={this.state.fromCurrency}
                onChange={event => { this.formChangeHandler(event); }}
              >
                <option value=""
                  disabled>Select currency from which to convert</option>
                {
                  Object.keys(this.state.decimalsForCurrencies).map(currency => {
                    return <option value={currency} key={currency}>{currency}</option>;
                  })
                }
              </Form.Control>
            </Col>
            <Col xs="12"
              md="5"
              lg="3"
            >
              <Form.Control style={{ textAlign: "center", width: "100%" }}
                name="from-amount"
                disabled={this.state.fromCurrency === "" || this.state.toCurrency === ""}
                placeholder={
                  this.state.fromCurrency === "" || this.state.toCurrency === "" ?
                    "Select from and to currencies" :
                    "Enter amount"
                }
                autoComplete="off"
                value={this.state.fromAmount.replace(/\B(?=((\d{3,3})+(\.|\b)))/g, ",")}  // add commas
                onChange={event => { this.formChangeHandler(event); }} />
            </Col>
          </Form.Group>
          <Row>
            <Col xs="12"
              md="6"
              style={{ textAlign: "center" }}
            >
              <h4>
                <strong>To:</strong>
              </h4>
            </Col>
          </Row>
          <Form.Group as={Row}>
            <Col xs="12"
              md={{ span: 5, offset: 1 }}
              lg={{ span: 3, offset: 3 }}
            >
              <Form.Control as="select"
                name="to-currency"
                style={{ textAlign: "center", width: "100%" }}
                value={this.state.toCurrency}
                onChange={event => { this.formChangeHandler(event); }}
              >
                <option value=""
                  disabled>Select currency into which to convert</option>
                {
                  Object.keys(this.state.decimalsForCurrencies).map(currency => {
                    return <option value={currency} key={currency}>{currency}</option>;
                  })
                }
              </Form.Control>
            </Col>
            <Col xs="12"
              md="5"
              lg="3"
            >
              <Form.Control style={{ textAlign: "center", width: "100%" }}
                disabled
                value={this.state.toAmount} />
            </Col>
          </Form.Group>
        </Form>
      </Container>
    );
  }
}

export default App;
