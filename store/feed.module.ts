import { AxiosResponse, AxiosError } from 'axios'
import { FETCH_FEED, SERVER_UPDATED } from './actions.type'
import {
  FETCH_FEED_END,
  FETCH_FEED_START,
  SERVER_MAP_CHANGED
} from './mutations.type'
import ApiResponse from '@/plugins/Repository/ApiResponse'
import Item from '@/models/api/feed/Item'
import Server from '@/models/api/servers/Server'

class State {
    public feedItems: Item[] = [];
    public feedItemsCount: number = -1;
    public isFeedItemsLoading: boolean = true;
}

const moduleState = () => new State()

const getters = {
  feedItems (state: State) {
    return state.feedItems
  },
  feedItemsCount (state: State) {
    return state.feedItemsCount
  },
  isFeedItemsLoading (state: State) {
    return state.isFeedItemsLoading
  }
}

const actions = {
  [FETCH_FEED] ({ commit }: any): any {
    commit(FETCH_FEED_START)
    return this.$repositories.feed.getFeedLatest().then((data: AxiosResponse<ApiResponse>) => {
      commit(FETCH_FEED_END, data)
    }).catch((err: AxiosError) => {
      this.$toast.error(err.message)
      console.log(err)
    })
  },
  [SERVER_UPDATED] ({ commit }: any, model: Server): any {
    commit(SERVER_MAP_CHANGED, model)
  }
}

const mutations = {
  [FETCH_FEED_START] (state: State) {
    state.isFeedItemsLoading = true
  },
  [FETCH_FEED_END] (state: State, resp: ApiResponse) {
    state.feedItems = resp.body.map((item: any) => new Item(item.ipAddress, item.port, item.serverName, item.mapName, item.lastUpdated))
    state.feedItemsCount = resp.body.length
    state.isFeedItemsLoading = false
  },
  [SERVER_MAP_CHANGED] (state: State, server: Server) {
    const newItem = new Item(server.ip_address, server.port, server.name, server.current_map, server.last_updated)
    state.feedItems = [newItem, ...state.feedItems]
    state.feedItemsCount = state.feedItemsCount + 1
  }
}

export default {
  state: moduleState,
  getters,
  actions,
  mutations
}