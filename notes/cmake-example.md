# CMake Example

> A simple cmake example



## Setup

Example project directory structure

```
├── build
├── CMakeLists.txt
├── HelloworldCore
│   ├── CMakeLists.txt
│   ├── Helloworld.cc
│   └── Helloworld.h
└── main.cc
```

`main.cc`

```c++
#include "HelloworldCore/Helloworld.h"

using HelloworldCore::Helloworld;

int main(int argc, char const *argv[])
{
	Helloworld ins;

	ins.greeting("Oh My CMake Example");

	return 0;
}
```

`CMakeLists.txt`

```cmake
cmake_minimum_required(VERSION 3.14.5)
project("CMake Example")

include_directories(${CMAKE_CURRENT_SOURCE_DIR})

add_subdirectory(HelloworldCore)

add_executable(hello main.cc)
target_link_libraries(hello libhelloworld)
```

`HelloworldCore/Helloworld.h`

```c++
#ifndef HELLOWORLD_CORE_H
#define HELLOWORLD_CORE_H

#include <string>
#include <iostream>

namespace HelloworldCore
{
	class Helloworld
	{
	public:
		Helloworld();
		~Helloworld();
		
		void greeting(const std::string& name);
	};
}

#endif
```

`HelloworldCore/Helloworld.cc`

```c++
#include "Helloworld.h"

namespace HelloworldCore
{
	Helloworld::Helloworld()
	{
	}

	Helloworld::~Helloworld()
	{
	}
		
	void Helloworld::greeting(const std::string& name)
	{
		std::cout << "Hello World: " << name << std::endl;
	}
}
```

`HelloworldCore/CMakeLists.txt`

```cmake
# generate the static library from the sources
add_library(libhelloworld STATIC Helloworld.cc)

# generate the shared library from the sources
# add_library(libhelloworld SHARED Helloworld.cc)
```



## Building

```bash
# to start a build we need to create a new folder
mkdir build
cd build

# and call cmake with the path to the project root
cmake ../
# by default cmake generates standard UNIX makefiles, we can change it use -G option
cmake -GNinja

# run the build
make
# or
ninja
```





## References

- [Introduction to CMake by Example](http://derekmolloy.ie/hello-world-introductions-to-cmake/)
- [Let's Build Chuck Norris! - Part 1: CMake and Ninja](https://dmerej.info/blog/post/chuck-norris-part-1-cmake-ninja/)
- [CMake Document](https://cmake.org/documentation/)

