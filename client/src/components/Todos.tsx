import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createMacro, deleteMacro, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Macro } from '../types/Macro'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Macro[]
  newTodoName: string
  loadingTodos: boolean,
  protein:number
  fat:number
  carbs:number
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true,
    protein:0,
    fat:0,
    carbs:0
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }
  handleProteinChange= (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ protein: Number(event.target.value) })
  }
  handleFatChange= (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ fat: Number(event.target.value) })
  }
  handleCarbsChange= (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ carbs: Number(event.target.value) })
  }

  onEditButtonClick = (macroId: string) => {
    this.props.history.push(`/macros/${macroId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newTodo = await createMacro(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate,
        protein: this.state.protein,
        carbs: this.state.carbs,
        fat: this.state.fat
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: ''
      })
    } catch {
      alert('Macro creation failed')
    }
  }

  onTodoDelete = async (macroId: string) => {
    try {
      await deleteMacro(this.props.auth.getIdToken(), macroId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.macroId != macroId)
      })
    } catch {
      alert('Macro deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.macroId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Macro deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Macros</Header>

        {this.renderCreateMacroInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateMacroInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Food',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Enter Food here..."
            onChange={this.handleNameChange}
          />
          <Input
            fluid
            actionPosition="left"
            placeholder="Protein"
            onChange={this.handleProteinChange}
          />
          <Input
            fluid
            actionPosition="left"
            placeholder="Fat"
            onChange={this.handleFatChange}
          />
          <Input
            fluid
            actionPosition="left"
            placeholder="Carbs"
            onChange={this.handleCarbsChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Macros
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.macroId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3}>
                Protein : {todo.protein}
              </Grid.Column>
              <Grid.Column width={2}>
                Fat : {todo.fat}
              </Grid.Column>
              <Grid.Column width={2}>
                Carbs : {todo.carbs}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.macroId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.macroId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
