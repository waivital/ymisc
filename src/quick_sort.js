/**
 * An implement of quick sort
 */

const target = [3, 7, 8, 5, 2, 1, 9, 5 ,4,]


function quickSort(array) {
  function getPivot(low, high) {
    return array[high]
  }

  function swap(i, j) {
    if (i !== j) {
      const t = array[i]
      array[i] = array[j]
      array[j] = t
    }
  }

  function partition(low, high) {
    const pivot = getPivot(low, high)

    let i = low
    let j = low

    for (; j < high; j++) {
      if (array[j] < pivot) {
        swap(i, j)
        i++
      }
    }

    swap(i, high)

    return i
  }

  function sort(low, high) {
    if (low < high) {
      const p = partition(low, high)
      sort(low, p - 1)
      sort(p + 1, high)
    }
  }

  sort(0, array.length - 1)

  return array
}


console.log(quickSort(target))
