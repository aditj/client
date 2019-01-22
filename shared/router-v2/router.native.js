// @flow
// // TODO modals
// under notch
// keyboard avoiding?
// hiding tab bar
// gateway
// statusbar handling
import * as Kb from '../common-adapters/mobile.native'
import * as I from 'immutable'
import * as Styles from '../styles'
import * as React from 'react'
import GlobalError from '../app/global-errors/container'
import Offline from '../offline/container'
import TabBar from './tab-bar/container'
import {
  createNavigator,
  SwitchRouter,
  StackRouter,
  StackActions,
  NavigationActions,
  NavigationContext,
  getNavigation,
  NavigationProvider,
  SceneView,
} from '@react-navigation/core'
import {createAppContainer} from '@react-navigation/native'
import {createBottomTabNavigator} from 'react-navigation-tabs'
import {createStackNavigator} from 'react-navigation-stack'
import {routes, nameToTab} from './routes'

// deprecating routestate concept entirely
// const emptyMap = I.Map()
// // don't path this likely
// const emptyList = I.List()
// class BridgeSceneView extends React.PureComponent {
// _routeProps = {
// get: key => this.props.navigation.getParam(key),
// }
// _pop = () => this.props.navigation.pop()

// // TODO remove all the routeprops etc
// render() {
// const Component = this.props.component
// const options = Component.navigationOptions || {}
// return (
// <NavigationContext.Provider value={this.props.navigation}>
// <Kb.ErrorBoundary>
// <Component
// routeProps={this._routeProps}
// routePath={emptyList}
// routeState={emptyMap}
// navigation={this.props.navigation}
// />
// </Kb.ErrorBoundary>
// {!options.skipOffline && <Offline />}
// <GlobalError />
// </NavigationContext.Provider>
// )
// }
// }

// The app with a tab bar on the left and content area on the right
// A single content view and n modals on top
// class AppView extends React.PureComponent {
// render() {
// const p = this.props
// const index = p.navigation.state.index
// // Find topmost non modal
// let nonModalIndex = index
// let modals = []
// while (nonModalIndex >= 0) {
// const activeKey = p.navigation.state.routes[nonModalIndex].key
// const descriptor = p.descriptors[activeKey]
// const Component = descriptor.getComponent()
// const options = Component.navigationOptions || {}
// if (!options.isModal) {
// break
// }
// modals.unshift(descriptor)
// --nonModalIndex
// }

// const activeKey = p.navigation.state.routes[nonModalIndex].key
// const descriptor = p.descriptors[activeKey]

// return (
// <Kb.Box2 direction="horizontal" fullHeight={true} fullWidth={true}>
// <TabBar selectedTab={nameToTab[descriptor.state.routeName]} />
// <Kb.Box2 direction="vertical" fullHeight={true} style={styles.contentArea}>
// <BridgeSceneView navigation={descriptor.navigation} component={descriptor.getComponent()} />
// </Kb.Box2>
// {modals.map(modal => {
// const Component = modal.getComponent()
// return (
// <Component
// key={modal.key}
// routeProps={{get: key => modal.navigation.getParam(key)}}
// routePath={emptyList}
// routeState={emptyMap}
// navigation={modal.navigation}
// />
// )
// })}
// </Kb.Box2>
// )
// }
// }

const StackNavigator = createStackNavigator(routes, {
  headerMode: 'none',
  initialRouteName: 'tabs:peopleTab',
})
// const tabNavigator = createBottomTabNavigator({
// people: stackNavigator,
// chat: stackNavigator,
// files: stackNavigator,
// settings: stackNavigator,
// })

/// / gets the current screen from navigation state
function getActiveRouteName(navigationState) {
  if (!navigationState) {
    return null
  }
  const route = navigationState.routes[navigationState.index]
  // dive into nested navigators
  if (route.routes) {
    return getActiveRouteName(route)
  }
  return route.routeName
}
class CustomStackNavigator extends React.PureComponent<any> {
  static router = StackNavigator.router

  render() {
    // const p = this.props
    // const index = p.navigation.state.index
    // // Find topmost non modal TODO maybe we odn't need this with multiple stacks?
    // let nonModalIndex = index
    // let modals = []
    // while (nonModalIndex >= 0) {
    // const activeKey = p.navigation.state.routes[nonModalIndex].key
    // const descriptor = p.descriptors[activeKey]
    // const Component = descriptor.getComponent()
    // const options = Component.navigationOptions || {}
    // if (!options.isModal) {
    // break
    // }
    // modals.unshift(descriptor)
    // --nonModalIndex
    // }
    // {nameToTab[descriptor.state.routeName]}
    // const activeKey = p.navigation.state.routes[nonModalIndex].key
    // const descriptor = p.descriptors[activeKey]
    return (
      <Kb.Box2 direction="vertical" fullWidth={true} fullHeight={true}>
        <Kb.SafeAreaViewTop />
        <StackNavigator navigation={this.props.navigation} />
        <TabBar selectedTab={this.props.selectedTab} />
        <GlobalError />
      </Kb.Box2>
    )
  }
}
const AppContainer = createAppContainer(CustomStackNavigator)

class RNApp extends React.Component<any, any> {
  state = {selectedTab: 'tabs:peopleTab'}
  _nav = null
  _onNavigationStateChange = (prevState, currentState) => {
    const currentScreen = getActiveRouteName(currentState)
    const prevScreen = getActiveRouteName(prevState)

    if (prevScreen !== currentScreen) {
      console.log('aaaa', currentScreen)
      const selectedTab = nameToTab[currentScreen]
      this.setState(p => (p.selectedTab === selectedTab ? null : {selectedTab}))
    }
  }

  dispatch = p => this._nav.dispatch(p)

  render() {
    return (
      <AppContainer
        ref={nav => (this._nav = nav)}
        onNavigationStateChange={this._onNavigationStateChange}
        selectedTab={this.state.selectedTab}
      />
    )
  }
}

// const AppNavigator = createNavigator(
// AppView,
// // TODO don't hardcode this
// StackRouter(routes, {initialRouteName: 'tabs:peopleTab'}),
// {}
// )

// const createRNApp = App => {
// const initAction = NavigationActions.init()

// // Based on https://github.com/react-navigation/react-navigation-web/blob/master/src/createBrowserApp.js
// class RNApp extends React.Component<any, any> {
// state = {nav: App.router.getStateForAction(initAction)}
// _actionEventSubscribers = new Set()
// _navigation: any
// componentDidMount() {
// this._actionEventSubscribers.forEach(subscriber =>
// subscriber({action: initAction, lastState: null, state: this.state.nav, type: 'action'})
// )
// }
// render() {
// this._navigation = getNavigation(
// App.router,
// this.state.nav,
// this._dispatch,
// this._actionEventSubscribers,
// () => this.props.screenProps,
// () => this._navigation
// )
// return (
// <NavigationProvider value={this._navigation}>
// <App navigation={this._navigation} />
// </NavigationProvider>
// )
// }
// // just so we have nice access to this in the action
// push = route => this._dispatch(StackActions.push(route))
// pop = () => this._dispatch(StackActions.pop())
// _dispatch = action => {
// const lastState = this.state.nav
// const newState = App.router.getStateForAction(action, lastState)
// const dispatchEvents = () =>
// this._actionEventSubscribers.forEach(subscriber =>
// subscriber({action, lastState, state: newState, type: 'action'})
// )
// if (newState && newState !== lastState) {
// this.setState({nav: newState}, dispatchEvents)
// } else {
// dispatchEvents()
// }
// }
// }
// return RNApp
// }

// const RNApp = createRNApp(AppNavigator)
// const RNApp = createAppContainer(tabNavigator)

const styles = Styles.styleSheetCreate({
  contentArea: {
    flexGrow: 1,
    position: 'relative',
  },
  modalContainer: {},
})

export default RNApp