const modal = {
  open() {
    //abrir modal
    //adicionar a classe active ao modal
    document.querySelector('.modal-overlay')
    .classList
    .add('active')
  },

  close() {
    //fechar o modal
    //remover a classe active do modal
    document.querySelector('.modal-overlay')
    .classList
    .remove('active')
  }
}

const Storage = {
  //salvar dados no navegador (localStorage)
  get() {
    //passa de string para array ou retorna um array vazio
    return JSON.parse(localStorage.getItem('finances:transactions')) || []
  },

  set(transactions) {
    //guardando array como stryng com json
    localStorage.setItem('finances:transactions', JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),

  remove(index) {
    //splice, metódo utilizado em arrays que conta o endereços do array
    Transaction.all.splice(index, 1)

    App.reload()
  },

  add(transaction){
    Transaction.all.push(transaction)

    App.reload()
  },

  incomes() {
    //somar entradas
    let income = 0
    Transaction.all.forEach(transaction => {
      if(transaction.amount > 0) {
        income += transaction.amount
      }
    })
    return income
  },

  expenses() {
    //somar as saídas
    let expense = 0
    Transaction.all.forEach(transaction => {
      if(transaction.amount < 0) {
        expense += transaction.amount
      }
    })
    return expense
  },

  total() {
    //entradas - saídas
    return Transaction.incomes() + Transaction.expenses()
  }
}

const dom = {
  //container das entradas de dados
  transactionsContainer: document.querySelector('#data-table tbody'),
  //Adiciona transações, cria a tag <tr> e cria o html
  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = dom.innerHTMLTransaction(transaction, index)
    //posição do array
    tr.dataset.index = index
    //adiciona os dados no html
    dom.transactionsContainer.appendChild(tr)
  },

  //cria o html para injetar no js
  innerHTMLTransaction(transaction, index) {
    //adiciona a classe css para mudar a cor do texto dependendo se for entrada ou sáida
    const CSSclass = transaction.amount > 0 ? "income" : "expense"
    //passa o valor da moeda formatado para uma váriavel
    const amount = Utils.formatCurrency(transaction.amount)
    const html = 
    `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img src="./assets/minus.svg" alt="Remover" onclick="Transaction.remove(${index})">
      </td>
    `
    return html
  },

  updateBalance() {
    //Atualiza os valores de entradas, saídas e total
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    // vai limpar as transações
    dom.transactionsContainer.innerHTML = ''
  }
}

const Utils = {
    formatAmount(value) {
      //pegando o valor, multiplcando por 100 por conta do formato puro de texto
      value = Number(value) * 100

      return value
    },

    formatDate(date) {
      //formatando a data, split tira o caracter que vc escolher
      const splittedDate = date.split("-")
      //data formatada com o array que o split gera
      return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
      //formata o valor para o estilo de moeda
      const signal = Number(value) < 0 ? '-' : ''
      //usa uma expressão regular para tratar o texto, nesse caso está selecionando apenas os caracteres que não são números e colocando "nada" no lugar
      value = String(value).replace(/\D/g, '')
      //converte a string em número e divide por 100 já que estamos adicionando os valorem sem vírgulas ou pontos inicialmente, transformando-os em valor real
      value = Number(value) / 100
      //formata o número para o tipo de moeda
      value = value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
      return signal + value
    }
}

const form = {
  //conectando js com html pelos inputs
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    //selecionando apenas os valores do inputs
    return {
      description: form.description.value,
      amount: form.amount.value,
      date: form.date.value
    }
  },

  formatValues() {
    //formatando os valores do inputs
    let {description, amount, date} = form.getValues()
    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  validateFields() {
    //capturando um erro
    //desestruturação dos campos para obter os valores
    const {description, amount, date} = form.getValues()
    if (description.trim() === ''
    || amount.trim() === ''
    || date.trim() === '') {
      throw new Error('Por favor preencha todos os campos')
    }
  },

  clearFields() {
    form.description.value = ''
    form.amount.value = ''
    form.date.value = ''
  },

  //pegando dados do formulário
  submit(event) {
    //não executa o comportamento padrão de salvar os dados na URL
    event.preventDefault()

    //capturando um erro
    try {

      //verificar se os campos foram preenchidos
      form.validateFields()
      //formatar dados
      const transaction = form.formatValues()
      //salvar dados e atualizar app 
      Transaction.add(transaction)
      //resetar formulário
      form.clearFields()
      //fechar modal
      modal.close()

    } catch (error) {
      alert(error.message)
    }
    
  }
}

const App = {
  init() {
    //forEach serve para arrays, e executa uma ação para cada elemento
    Transaction.all.forEach((transaction, index) => {
      dom.addTransaction(transaction, index)
    })

    dom.updateBalance()

    Storage.set(Transaction.all)

  },

  reload() {
    //vai limpar para popular novamente
    dom.clearTransactions()
    App.init()
  }
}

App.init()


