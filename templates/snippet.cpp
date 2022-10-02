template <class T>
struct StaticRangeSum {
   StaticRangeSum() = default;
   explicit StaticRangeSum(const vec<T>& seq) {
      const int n = len(seq);
      sums.resize(n + 1);
      sums[0] = 0;
      partial_sum(all(seq), begin(sums) + 1);
   }

   T get(int r) const {
      return get(0, r);
   }
   T operator ()(int r) const { return get(0, r); }

   T get(int l, int r) const {
      assert(0 <= l and l < r and r <= len(sums) - 1);
      return sums[r] - sums[l];
   }
   T operator ()(int l, int r) const { return get(l, r); }

   int lower_bound(T val) const {
      return distance(cbegin(sums) + 1, lower_bound(cbegin(sums) + 1, sums.cend(), val));
   }

   int upper_bound(T val) const {
      return distance(cbegin(sums) + 1, upper_bound(cbegin(sums) + 1, sums.cend(), val));
   }

   vec<T> sums;
};