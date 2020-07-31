import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

import incomeSvg from '../../assets/income.svg';
import outcomeSvg from '../../assets/outcome.svg';
import totalSvg from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  millisDate: number;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: string;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      return api.get('/transactions').then(response => {
        const formattedTransactions = response.data.transactions.map(
          (transaction: Transaction) => ({
            ...transaction,
            formattedValue:
              (transaction.type === 'outcome' ? '- ' : '') +
              formatValue(transaction.value),
            formattedDate: DateTime.fromISO(transaction.created_at).toFormat(
              'dd/MM/yyyy',
            ),
            millisDate: DateTime.fromISO(transaction.created_at).toMillis(),
          }),
        );
        const { income, outcome, total } = response.data.balance;
        const formattedBalance = {
          income: formatValue(income),
          outcome: formatValue(outcome),
          total: formatValue(total),
        };

        setBalance(formattedBalance);
        setTransactions(formattedTransactions);
      });
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={incomeSvg} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcomeSvg} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={totalSvg} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions
                ?.sort((a, b) => b.millisDate - a.millisDate)
                .map((transaction, index) => (
                  <tr key={transaction.title + index}>
                    <td className="title">{transaction.title}</td>
                    <td className={transaction.type}>
                      {transaction.formattedValue}
                    </td>
                    <td>{transaction.category.title}</td>
                    <td>{transaction.formattedDate}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
