import PropTypes from 'prop-types'
import React from 'react'
import theme from '../styles/theme'
import CircularProgress from 'material-ui/CircularProgress'
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card'
import gql from 'graphql-tag'
import loadData from '../containers/hoc/load-data'
import wrapMutations from '../containers/hoc/wrap-mutations'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import TextField from 'material-ui/TextField'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
import ContentAdd from 'material-ui/svg-icons/content/add'
import ActionDelete from 'material-ui/svg-icons/action/delete'

const innerStyles = {
  button: {
    margin: '24px 5px 24px 0',
    fontSize: '10px'
  },
  nestedItem: {
    fontSize: '12px'
  }
}

const initialState = {
  selecting: false,
  selected: undefined,
  searching: undefined,
  extraCustomFields: []
}

class ExternalListNavigator extends React.Component {
  constructor(props) {
    super(props)
    this.state = Object.assign({}, initialState)
  }

  toggleSelecting = () => this.setState({ selecting: !this.state.selecting })
  onSearch = (_, searching) => this.setState({ searching })

  onCustomFieldsKeyChange = idx => (_, text) => {
    this.state.extraCustomFields[idx].key = text
    this.forceUpdate()
  }

  onCustomFieldsValueChange = idx => (_, text) => {
    this.state.extraCustomFields[idx].value = text
    this.forceUpdate()
  }

  addCustomField = () => {
    this.state.extraCustomFields.push({ key: '', value: '' })
    this.forceUpdate()
  }

  deleteCustomField = idx => () => {
    this.state.extraCustomFields.splice(idx, 1)
    this.forceUpdate()
  }

  select = id => () =>
    this.setState({
      selected: id,
      selecting: false
    })

  startImport = () => this.setState(Object.assign({}, initialState))

  render() {
    return (
      <div>
        <RaisedButton
          style={innerStyles.button}
          label='Select List'
          labelPosition='before'
          onClick={this.toggleSelecting}
        />

        {(this.state.selecting || this.state.selected) && (
          <Dialog
            open
            onRequestClose={this.toggleSelecting}
            actions={[
              <FlatButton secondary onClick={this.toggleSelecting}>
                Cancel
              </FlatButton>
            ].concat(
              this.state.selected
                ? [
                  <FlatButton primary onClick={this.startImport}>
                      Start Import
                    </FlatButton>
                ]
                : []
            )}
          >
            {this.state.selecting &&
              !this.state.selected && [
                <TextField
                  hintText='Search by name or description...'
                  fullWidth
                  onChange={this.onSearch}
                />,
                <div style={{ overflow: 'scroll', maxHeight: 'inherit' }}>
                  {this.props.listData.organization.osdiLists
                    .filter(
                      ({ name, summary }) =>
                        this.state.searching !== undefined
                          ? name
                              .toLowerCase()
                              .includes(this.state.searching.toLowerCase()) ||
                            summary
                              .toLowerCase()
                              .includes(this.state.searching.toLowerCase())
                          : true
                    )
                    .map(({ id, name, summary }) => (
                      <Card>
                        <CardHeader title={name} subtitle={summary} />
                        <CardActions>
                          <FlatButton
                            label='Import'
                            primary
                            onClick={this.select(id)}
                          />
                        </CardActions>
                      </Card>
                    ))}
                </div>
              ]}

            {this.state.selected !== undefined &&
              !this.state.selecting && (
                <div>
                  Importing a list adds 'first_name', 'last_name', 'cell',
                  'email', and 'zip'. To add more custom fields, you can enter
                  them here. They will be the same for all contacts.
                  {this.state.extraCustomFields.map(({ key, value }, idx) => (
                    <div>
                      <TextField
                        hintText='Column Name'
                        value={key}
                        onChange={this.onCustomFieldsKeyChange(idx)}
                      />
                      <TextField
                        hintText='Value'
                        value={value}
                        onChange={this.onCustomFieldsValueChange(idx)}
                      />
                      <IconButton onClick={this.deleteCustomField(idx)}>
                        <ActionDelete />
                      </IconButton>
                    </div>
                  ))}
                  <br />
                  <IconButton onClick={this.addCustomField}>
                    <ContentAdd />
                  </IconButton>
                </div>
              )}
          </Dialog>
        )}
      </div>
    )
  }
}

ExternalListNavigator.propTypes = {
  organizationId: PropTypes.string
}

const mapQueriesToProps = ({ ownProps }) => {
  const map = {
    listData: {
      query: gql`
        query getLists($organizationId: String!) {
          organization(id: $organizationId) {
            id
            osdiEnabled
            osdiLists {
              name
              id
              identifiers
              summary
            }
          }
        }
      `,
      variables: {
        organizationId: ownProps.organizationId
      }
    }
  }

  return map
}

export default loadData(wrapMutations(ExternalListNavigator), {
  mapQueriesToProps
})
