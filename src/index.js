import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { search, parse_response, get_issues, parse_issues } from './api.js'

/*
var mock_repo = {
  stargazers_count: 981,
  full_name: 'node',
  description: 'some project related info',
  html_url: 'https://example.com'
}

var mock_issue = {
  name: 'issue_name',
  labels: ['tag1', 'tag2', 'tag3'],
  html_url: 'https://example.com'
}
*/

class SearchForm extends React.Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit} className='search field has-addons'>
        <div className='control'>
          <input
            className='search-fld input'
            type='text'
            placeholder='Your languages of choice...'
            value={this.props.input_value}
            onChange={this.props.handleChange} />
        </div>
        <div className='control'>
          <input
            className='submit-btn button is-info'
            type='submit'
            value='Search' />
        </div>
      </form>
    )
  }
}

class Header extends React.Component {
  render() {
    return (
      <div className='header'>
        <ul>
          <li className='logo' />
          <li className='search-bar'>
            <SearchForm
              handleSubmit={this.props.handleSubmit}
              handleChange={this.props.handleChange}
              inputValue={this.props.inputValue} />
          </li>
        </ul>
      </div>
    )
  }
}

class Issue extends React.Component {
  render() {
    return (
      <tr className='issue'>
        <td className='column-1 border-right border-left'><div>
          <a href={this.props.html_url}>{this.props.name}</a>
        </div></td>
        <td className='column-2 border-right'><div className='tags'>
          {this.props.labels.map((label) => (
            <span className='tag is-light'>{label}</span>
          ))}
        </div></td>
        <td className='column-3 boder-right'><div></div></td>
      </tr>
    )

  }
}

class IssueRows extends React.Component {
  render() {
    let issues = this.props.data
      ? this.props.data.map((p, i) => (
        <Issue name={p.title}
          labels={p.labels}
          html_url={p.html_url}
          key={i} />))
      : <Fragment></Fragment>
    if (issues.length == 0) {
      issues =
        <tr className='issue'>
          <td className='column-1 border-right border-left'><div></div></td>
          <td className='column-2 border-right'>
            <div className='notification is-danger is-light'>
              No issues found</div></td>
          <td className='column-3 boder-right'><div></div></td>
        </tr>
    }
    return (
      <Fragment>
        {issues}
      </Fragment>
    )
  }
}

class Repo extends React.Component {
  render() {
    const issues = this.props.issue_data
      ? <IssueRows data={this.props.issue_data} />
      : <Fragment></Fragment>
    return (
      <Fragment>
        <tr className='repo'>
          <td className='column-1 border-right border-left'><div>
            <a href={this.props.html_url}>{this.props.name}</a></div></td>
          <td className='column-2 border-right'
            onClick={_ => this.props.clickHandler(this.props.index)}><div>
              {this.props.description}</div></td>
          <td className='column-3 border-right'><div>{this.props.stargazers}</div></td>
        </tr>
        {issues}
      </Fragment>
    )
  }
}

class PageLink extends React.Component {
  render() {
    const is_current = this.props.is_current ? ' is-current' : ''
    const num = this.props.num
    return (
      <li><a className={'pagination-link' + is_current} 
             onClick={_=>this.props.handleClick(num)}>
               {num}
          </a>
      </li>
    )
  }
}

class Navigation extends React.Component {
  render() {
    const current_page = this.props.current_page

    let page_links = Array.from({length: this.props.total_pages}, 
      (_, i)=>(
        <PageLink handleClick={this.props.handleClick} num={i+1}/>
      ))
    page_links[current_page-1] = 
      <PageLink handleClick={this.props.handleClick} 
                num={current_page}
                is_current/>
    return (
      <nav className='pagination' role='naviagtion'>
        <ul className='pagination-list'>
          {page_links}
          <li><span className='pagination-ellipsis'>&hellip;</span></li>
        </ul>
      </nav>
    )
  }
}

class RepoTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      issue_states: new Set(),
      issue_data: new Map()
    }

    this.clickHandler = this.clickHandler.bind(this)
  }

  async clickHandler(i) {
    console.log('clicked ' + String(i) + ' description')
    let new_issue_states = new Set(this.state.issue_states)
    let new_issue_data = new Map(this.state.issue_data)

    if (new_issue_states.has(i)) {
      new_issue_states.delete(i)
      new_issue_data.delete(i)
      this.setState({
        issue_data: new_issue_data,
        issue_states: new_issue_states
      })
    } else {
      new_issue_states.add(i)
      let repo = this.props.data[i].html_url
        .match(/^https:\/\/github\.com\/(.*)$/)[1]
      let issues = await get_issues(repo)
      new_issue_data.set(i, parse_issues(issues))
      console.log('Issue data updated for ', i, ' : ', new_issue_data)
      this.setState({
        issue_data: new_issue_data,
        issue_states: new_issue_states
      })
    }
  }

  render() {
    const repos = this.props.data
      ?
      this.props.data.map((p, i) => (
        <Repo name={p.full_name}
          description={p.description}
          stargazers={p.stargazers_count}
          html_url={p.html_url}
          clickHandler={this.clickHandler}
          key={i}
          index={i}
          issue_data={this.state.issue_data.get(i)} />))
      :
      <tr></tr>

    return (
      <table className='repo-list table is-striped is-hoverable is-fullwidth'>
        <thead>
          <tr className='header border-bottom'>
            <th className='column-1 border-right border-left'><div>Project</div></th>
            <th className='column-2 border-right'><div>Description</div></th>
            <th className='column-3 border-right'><div>Stars</div></th>
          </tr>
        </thead>
        <tbody>
          {repos}
        </tbody>
      </table>
    )
  }
}

class Root extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      input_value: '',
      search_results: undefined,
      current_page: 1,
      latest_search: undefined,
      total_pages: 2,
      search_performed: false
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleNavClick = this.handleNavClick.bind(this)
  }

  async handleSubmit(event) {
    event.preventDefault()
    let result = await search(this.state.input_value.split(' '), this.state.current_page)
    let parsed_result = parse_response(result)
    this.setState({
      ...this.state,
      search_results: parsed_result,
      current_page: 1,
      latest_search: this.state.input_value,
      search_performed: true
    })
  }

  handleChange(event) {
    this.setState({
      ...this.state,
      input_value: event.target.value
    })
  }

  async handleNavClick(i) {
    console.log('switching to page ', i, ' ...')
    const total_pages = this.state.total_pages
    const new_total_pages = i >= total_pages ? (total_pages + 1) : total_pages
    let result = await search(this.state.input_value.split(' '), i)
    let parsed_result = parse_response(result)
    this.setState({
      ...this.state,
      search_results: parsed_result,
      current_page: i,
      total_pages: new_total_pages
    })
  }

  render() {
    const navigation = this.state.search_performed
    ?
      <Navigation
        current_page={this.state.current_page}
        total_pages={this.state.total_pages}
        handleClick={this.handleNavClick}/>
    : <Fragment/>
    return (
      <div className='main'>
        <Header
          handleSubmit={this.handleSubmit}
          handleChange={this.handleChange}
          inputValue={this.state.input_value}/>
        <RepoTable
          data={this.state.search_results}/>
        {navigation}
      </div>
    )
  }
}

// ========================================

ReactDOM.render(
  <Root />,
  document.getElementById('root')
);