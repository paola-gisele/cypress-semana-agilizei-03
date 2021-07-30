/// <reference types="cypress" />

import { format, prepareLocalStorage } from '../support/utils'

// configurar o tamanho da tela
// cy.viewport
// arquivos de config
// configs por linha de comando = npx cypress open --config viewportWidth=411,viewportHeight=823

context('Dev Finances Agilizei', () => {

    // hooks
    // trechos que executam antes e depois do teste
    // before -> antes de todos os testes
    // beforeEach -> antes de cada teste
    // after -> depois de todos os testes
    // afterEach -> depois de cada teste

    beforeEach(() => {
        cy.visit('https://devfinance-agilizei.netlify.app/#', {
            onBeforeLoad: (win) => {
                prepareLocalStorage(win)
            }
            // onLoad => durante a execução da página
            // onBeforeLoad => antes de abrir a página
        })
        //cy.get('#data-table tbody tr').should('have.length', 2)
    });

    it('Cadastar entradas', () => {

        cy.get('#transaction .button').click() // id + classe
        cy.get('#description').type('Mesada') // id
        cy.get('[name=amount]').type(12) // atributos
        cy.get('[name=date]').type('2021-07-27') // atributos
        cy.get('button').contains('Salvar').click() // tipo e valor

        cy.get('#data-table tbody tr').should('have.length', 3)
    });

    it('Cadastrar saídas', () => {

        cy.get('#transaction .button').click() // id + classe
        cy.get('#description').type('Presente') // id
        cy.get('[name=amount]').type(-12) // atributos
        cy.get('[name=date]').type('2021-07-27') // atributos
        cy.get('button').contains('Salvar').click() // tipo e valor

        cy.get('#data-table tbody tr').should('have.length', 3)
    });

    it('Remover entradas e saídas', () => {

        // estratégia 1: voltar para o elemento pai, e avnçar para um td img attr

        cy.get('td.description')
            .contains("Mesada")
            .parent()
            .find('img[onclick *= remove]')
            .click()

        // estratégia 2: buscar todos os irmãos, e buscar o que tem img + attr

        cy.get('td.description')
            .contains('Suco Kapo')
            .siblings()
            .children('img[onclick *= remove]')
            .click()

        cy.get('#data-table tbody tr').should('have.length', 0)
    });

    it('Validar saldo com diversas transações', () => {
        let incomes = 0
        let expenses = 0

        // capturar as linhas com as transaçoes e as colunas com valores
        cy.get('#data-table tbody tr')
            .each(($el, index, $list) => {

                // capturar o texto dessas colunas
                cy.get($el).find('td.income, td.expense').invoke('text').then(text => {

                    cy.log(text)
                    // formatar esses valores das linhas
                    cy.log(format(text)) // texto em javaScript

                    if (text.includes('-')) {
                        expenses = expenses + format(text)
                    } else {
                        incomes = incomes + format(text)
                    }

                    cy.log(`Entradas`, incomes)
                    cy.log(`Saídas`, expenses)
                })
            })

        // capturar o texto do total
        cy.get('#totalDisplay').invoke('text').then(text => {

            cy.log(`Valor total`, format(text))

            // somar os valores de entradas e saídas
            let formattedTotalDisplay = format(text)
            let expectedTotal = incomes + expenses

            // comparar o somatório de entradas e despesas com o total
            expect(formattedTotalDisplay).to.eq(expectedTotal)

        })
    });

    // npx cypress run = abrir em headless
    // npx cypress open = abrir com browser
});