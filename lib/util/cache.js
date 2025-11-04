/*!
 * check4ai.cache
 * Copyright(c) 2023-2025 Ali Murat Bozaci
 * GNU General Public License v3.0
 */

const crypto = require('crypto');

/**
 * Simple in-memory cache for AI detection results
 * Reduces redundant API calls and improves performance
 */

class Cache {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.ttl = options.ttl || 3600000; // 1 hour default
        this.maxSize = options.maxSize || 1000; // Maximum cache entries
        this.cache = new Map();
        this.accessCount = new Map();

        // Clean up expired entries periodically
        if (this.enabled) {
            this.cleanupInterval = setInterval(() => this.cleanup(), 300000); // 5 minutes
        }
    }

    /**
     * Generate cache key from text
     */
    generateKey(text, detector = null) {
        const hash = crypto.createHash('sha256');
        hash.update(text);
        if (detector) {
            hash.update(detector);
        }
        return hash.digest('hex');
    }

    /**
     * Get cached result
     */
    get(key) {
        if (!this.enabled) return null;

        const entry = this.cache.get(key);

        if (!entry) return null;

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.accessCount.delete(key);
            return null;
        }

        // Update access count (for LRU eviction)
        this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);

        return entry.data;
    }

    /**
     * Set cached result
     */
    set(key, data) {
        if (!this.enabled) return;

        // If cache is full, evict least recently used
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }

        this.cache.set(key, {
            data: data,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.ttl
        });

        this.accessCount.set(key, 1);
    }

    /**
     * Evict least recently used entry
     */
    evictLRU() {
        let minAccess = Infinity;
        let lruKey = null;

        for (const [key, count] of this.accessCount.entries()) {
            if (count < minAccess) {
                minAccess = count;
                lruKey = key;
            }
        }

        if (lruKey) {
            this.cache.delete(lruKey);
            this.accessCount.delete(lruKey);
        }
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            this.cache.delete(key);
            this.accessCount.delete(key);
        });

        if (keysToDelete.length > 0) {
            console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`);
        }
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.accessCount.clear();
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            enabled: this.enabled,
            ttl: this.ttl
        };
    }

    /**
     * Destroy cache and cleanup interval
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.clear();
    }
}

module.exports = Cache;
