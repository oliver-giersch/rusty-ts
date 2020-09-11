import { Option } from './option'

export class HashMap<K, V> {
    constructor(private map: Map<K, V>) {}

    static from<K, V>(map: Map<K, V>) {
        return new HashMap(map)
    }

    get(key: K): Option<V> {
        return Option.from(this.map.get(key))
    }

    insert(key: K, value: V): Option<V> {
        const prev = this.get(key)
        this.map.set(key, value)
        return prev
    }
}