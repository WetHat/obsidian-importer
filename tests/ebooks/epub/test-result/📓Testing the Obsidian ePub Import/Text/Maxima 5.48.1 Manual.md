---
book: "[[../📓Testing the Obsidian ePub Import.md|Testing the Obsidian ePub Import]]"
tags: [Obsidian/Plugin,RegressionTest]
---

## 10 Elementary Functions ^Elementary-Functions-1

- [Functions for Numbers](#^Functions-for-Numbers)
- [Functions for Complex Numbers](#^Functions-for-Complex-Numbers)
- [Combinatorial Functions](#^Combinatorial-Functions)
- [Root, Exponential and Logarithmic Functions](#^Root-Exponential-and-Logarithmic-Functions)
- [Trigonometric Functions](#^Trigonometric-Functions)
- [Random Numbers](#^Random-Numbers)

---

Next: [Functions for Complex Numbers](#^Functions-for-Complex-Numbers), Up: [Elementary Functions](maxima_singlepage_split_009.html#Elementary-Functions) \[[Contents](maxima_singlepage_split_000.html#SEC_Contents "Table of contents")\]\[[Index](maxima_singlepage_split_102.html#Function-and-Variable-Index "Index")\]

### 10.1 Functions for Numbers ^Functions-for-Numbers-1

Function: **abs** (z)

The `abs` function represents the mathematical absolute value function and works for both numerical and symbolic values. If the argument, z, is a real or complex number, `abs` returns the absolute value of z. If possible, symbolic expressions using the absolute value function are also simplified.

Maxima can differentiate, integrate and calculate limits for expressions containing `abs`. The `abs_integrate` package further extends Maxima’s ability to calculate integrals involving the abs function. See (%i12) in the examples below.

When applied to a list or matrix, `abs` automatically distributes over the terms. Similarly, it distributes over both sides of an equation. To alter this behaviour, see the variable `distribute_over`.

See also `cabs`.

Examples:

Calculation of `abs` for real and complex numbers, including numerical constants and various infinities. The first example shows how `abs` distributes over the elements of a list.

```undefined
(%i1) abs([-4, 0, 1, 1+%i]);
(%o1)                  [4, 0, 1, sqrt(2)]
```

```undefined
(%i2) abs((1+%i)*(1-%i));
(%o2)                           2
```

```undefined
(%i3) abs(%e+%i);
                                 2
(%o3)                     sqrt(%e  + 1)
```

```undefined
(%i4) abs([inf, infinity, minf]);
(%o4)                    [inf, inf, inf]
```

Simplification of expressions containing `abs`:

```undefined
(%i1) abs(x^2);
                                2
(%o1)                          x
```

```undefined
(%i2) abs(x^3);
                             2
(%o2)                       x  abs(x)
```

```undefined
(%i3) abs(abs(x));
(%o3)                        abs(x)
```

```undefined
(%i4) abs(conjugate(x));
(%o4)                        abs(x)
```

Integrating and differentiating with the `abs` function. Note that more integrals involving the `abs` function can be performed, if the `abs_integrate` package is loaded. The last example shows the Laplace transform of `abs`: see `laplace`.

```undefined
(%i1) diff(x*abs(x),x),expand;
(%o1)                       2 abs(x)
```

```undefined
(%i2) integrate(abs(x),x);
                            x abs(x)
(%o2)                       --------
                               2
```

```undefined
(%i3) integrate(x*abs(x),x);
                          
                          |
(%o3)                     | x abs(x) dx
                          |
```

```undefined
(%i4) load("abs_integrate")$
```

```undefined
(%i5) integrate(x*abs(x),x);
                           3
                          x  signum(x)
(%o5)                     ------------
                               3
```

```undefined
(%i6) integrate(abs(x),x,-2,%pi);
                               2
                            %pi
(%o6)                       ---- + 2
                             2
```

```undefined
(%i7) laplace(abs(x),x,s);
                               1
(%o7)                          --
                                2
                               s
```

Categories: [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) ·

Function: **ceiling** (x)

When x is a real number, return the least integer that is greater than or equal to x.

If x is a constant expression (`10 * %pi`, for example), `ceiling` evaluates x using big floating point numbers, and applies `ceiling` to the resulting big float. Because `ceiling` uses floating point evaluation, it’s possible, although unlikely, that `ceiling` could return an erroneous value for constant inputs. To guard against errors, the floating point evaluation is done using three values for `fpprec`.

For nonconstant inputs, `ceiling` tries to return a simplified value. Here are examples of the simplifications that `ceiling` knows about:

```undefined
(%i1) ceiling (ceiling (x));
(%o1)                      ceiling(x)
```

```undefined
(%i2) ceiling (floor (x));
(%o2)                       floor(x)
```

```undefined
(%i3) declare (n, integer)$
```

```undefined
(%i4) [ceiling (n), ceiling (abs (n)), ceiling (max (n, 6))];
(%o4)                [n, abs(n), max(6, n)]
```

```undefined
(%i5) assume (x > 0, x < 1)$
```

```undefined
(%i6) ceiling (x);
(%o6)                           1
```

```undefined
(%i7) tex (ceiling (a));
$$\left \lceil a \right \rceil$$
(%o7)                         false
```

The `ceiling` function distributes over lists, matrices and equations. See `distribute_over`.

Finally, for all inputs that are manifestly complex, `ceiling` returns a noun form.

If the range of a function is a subset of the integers, it can be declared to be `integervalued`. Both the `ceiling` and `floor` functions can use this information; for example:

```undefined
(%i1) declare (f, integervalued)$
```

```undefined
(%i2) floor (f(x));
(%o2)                         f(x)
```

```undefined
(%i3) ceiling (f(x) - 1);
(%o3)                       f(x) - 1
```

Example use:

```undefined
(%i1) unitfrac(r) := block([uf : [], q],
    if not(ratnump(r)) then
       error("unitfrac: argument must be a rational number"),
    while r # 0 do (
        uf : cons(q : 1/ceiling(1/r), uf),
        r : r - q),
    reverse(uf));
(%o1) unitfrac(r) := block([uf : [], q], 
if not ratnump(r) then error("unitfrac: argument must be a rational number"
                                     1
), while r # 0 do (uf : cons(q : ----------, uf), r : r - q), 
                                         1
                                 ceiling(-)
                                         r
reverse(uf))
```

```undefined
(%i2) unitfrac (9/10);
                            1  1  1
(%o2)                      [-, -, --]
                            2  3  15
```

```undefined
(%i3) apply ("+", %);
                               9
(%o3)                          --
                               10
```

```undefined
(%i4) unitfrac (-9/10);
                                  1
(%o4)                       [- 1, --]
                                  10
```

```undefined
(%i5) apply ("+", %);
                                9
(%o5)                         - --
                                10
```

```undefined
(%i6) unitfrac (36/37);
                        1  1  1  1    1
(%o6)                  [-, -, -, --, ----]
                        2  3  8  69  6808
```

```undefined
(%i7) apply ("+", %);
                               36
(%o7)                          --
                               37
```

Categories: [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) ·

Function: **entier** (x)

Returns the largest integer less than or equal to x where x is numeric. `fix` (as in `fixnum`) is a synonym for this, so `fix(x)` is precisely the same.

Categories: [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) ·

Function: **floor** (x)

When x is a real number, return the largest integer that is less than or equal to x.

If x is a constant expression (`10 * %pi`, for example), `floor` evaluates x using big floating point numbers, and applies `floor` to the resulting big float. Because `floor` uses floating point evaluation, it’s possible, although unlikely, that `floor` could return an erroneous value for constant inputs. To guard against errors, the floating point evaluation is done using three values for `fpprec`.

For nonconstant inputs, `floor` tries to return a simplified value. Here are examples of the simplifications that `floor` knows about:

```undefined
(%i1) floor (ceiling (x));
(%o1)                      ceiling(x)
```

```undefined
(%i2) floor (floor (x));
(%o2)                       floor(x)
```

```undefined
(%i3) declare (n, integer)$
```

```undefined
(%i4) [floor (n), floor (abs (n)), floor (min (n, 6))];
(%o4)                [n, abs(n), min(6, n)]
```

```undefined
(%i5) assume (x > 0, x < 1)$
```

```undefined
(%i6) floor (x);
(%o6)                           0
```

```undefined
(%i7) tex (floor (a));
$$\left \lfloor a \right \rfloor$$
(%o7)                         false
```

The `floor` function distributes over lists, matrices and equations. See `distribute_over`.

Finally, for all inputs that are manifestly complex, `floor` returns a noun form.

If the range of a function is a subset of the integers, it can be declared to be `integervalued`. Both the `ceiling` and `floor` functions can use this information; for example:

```undefined
(%i1) declare (f, integervalued)$
```

```undefined
(%i2) floor (f(x));
(%o2)                         f(x)
```

```undefined
(%i3) ceiling (f(x) - 1);
(%o3)                       f(x) - 1
```

Categories: [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) ·

Function: **fix** (x)

A synonym for `entier (x)`.

Categories: [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) ·

Function: **hstep** (x)

The Heaviside unit step function, equal to 0 if x is negative, equal to 1 if x is positive and equal to 1/2 if x is equal to zero.

If you want a unit step function that takes on the value of 0 at x equal to zero, use `unit_step`.

Categories: [Laplace transform](maxima_singlepage_split_102.html#Category_003a-Laplace-transform) · [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) ·

Function: **lmax** (L)

When L is a list or a set, return `apply ('max, args (L))`. When L is not a list or a set, signal an error. See also `lmin` and `max`.

Categories: [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) · [Lists](maxima_singlepage_split_102.html#Category_003a-Lists) · [Sets](maxima_singlepage_split_102.html#Category_003a-Sets) ·

Function: **lmin** (L)

When L is a list or a set, return `apply ('min, args (L))`. When L is not a list or a set, signal an error. See also `lmax` and `min`.

Categories: [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) · [Lists](maxima_singlepage_split_102.html#Category_003a-Lists) · [Sets](maxima_singlepage_split_102.html#Category_003a-Sets) ·

Function: **max** (x_1, …, x_n)

Return a simplified value for the numerical maximum of the expressions x_1 through x_n. For an empty argument list, `max` yields `minf`.

The option variable `maxmin_effort` controls which simplification methods are applied. Using the default value of _twelve_ for `maxmin_effort`, `max` uses _all_ available simplification methods. To to inhibit all simplifications, set `maxmin_effort` to zero.

When `maxmin_effort` is one or more, for an explicit list of real numbers, `max` returns a number.

Unless `max` needs to simplify a lengthy list of expressions, we suggest using the default value of `maxmin_effort`. Setting `maxmin_effort` to zero (no simplifications), will cause problems for some Maxima functions; accordingly, generally `maxmin_effort` should be nonzero.

See also `min`, `lmax`., and `lmin`..

**Examples:**

In the first example, setting `maxmin_effort` to zero suppresses simplifications.

```undefined
(%i1) block([maxmin_effort : 0], max(1,2,x,x, max(a,b)));
(%o1) max(1,2,max(a,b),x,x)

(%i2) block([maxmin_effort : 1], max(1,2,x,x, max(a,b)));
(%o2) max(2,a,b,x)
```

When `maxmin_effort` is two or more, `max` compares pairs of members:

```undefined
(%i1) block([maxmin_effort : 1], max(x,x+1,x+3));
(%o1) max(x,x+1,x+3)

(%i2) block([maxmin_effort : 2], max(x,x+1,x+3));
(%o2) x+3
```

Finally, when `maxmin_effort` is three or more, `max` compares triples members and excludes those that are in between; for example

```undefined
(%i1) block([maxmin_effort : 4], max(x, 2*x, 3*x, 4*x));
(%o1) max(x,4*x)
```

Categories: [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) ·

Function: **min** (x_1, …, x_n)

Return a simplified value for the numerical minimum of the expressions x_1 through x_n. For an empty argument list, `minf` yields `inf`.

The option variable `maxmin_effort` controls which simplification methods are applied. Using the default value of _twelve_ for `maxmin_effort`, `max` uses _all_ available simplification methods. To to inhibit all simplifications, set `maxmin_effort` to zero.

When `maxmin_effort` is one or more, for an explicit list of real numbers, `min` returns a number.

Unless `min` needs to simplify a lengthy list of expressions, we suggest using the default value of `maxmin_effort`. Setting `maxmin_effort` to zero (no simplifications), will cause problems for some Maxima functions; accordingly, generally `maxmin_effort` should be nonzero.

See also `max`, `lmax`., and `lmin`..

**Examples:**

In the first example, setting `maxmin_effort` to zero suppresses simplifications.

```undefined
(%i1) block([maxmin_effort : 0], min(1,2,x,x, min(a,b)));
(%o1) min(1,2,a,b,x,x)

(%i2) block([maxmin_effort : 1], min(1,2,x,x, min(a,b)));
(%o2) min(1,a,b,x)
```

When `maxmin_effort` is two or more, `min` compares pairs of members:

```undefined
(%i1) block([maxmin_effort : 1], min(x,x+1,x+3));
(%o1) min(x,x+1,x+3)

(%i2) block([maxmin_effort : 2], min(x,x+1,x+3));
(%o2) x
```

Finally, when `maxmin_effort` is three or more, `min` compares triples members and excludes those that are in between; for example

```undefined
(%i1) block([maxmin_effort : 4], min(x, 2*x, 3*x, 4*x));
(%o1) max(x,4*x)
```

Categories: [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) ·

Function: **round** (x)

When x is a real number, returns the closest integer to x. Multiples of 1/2 are rounded to the nearest even integer. Evaluation of x is similar to `floor` and `ceiling`.

The `round` function distributes over lists, matrices and equations. See `distribute_over`.

Categories: [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) ·

Function: **signum** (x)

For either real or complex numbers x, the signum function returns 0 if x is zero; for a nonzero numeric input x, the signum function returns `x/abs(x)`.

For nonnumeric inputs, Maxima attempts to determine the sign of the input. When the sign is negative, zero, or positive, `signum` returns -1,0, 1, respectively. For all other values for the sign, `signum` a simplified but equivalent form. The simplifications include reflection (`signum(-x)` gives `-signum(x)`) and multiplicative identity (`signum(x*y)` gives `signum(x) * signum(y)`).

The `signum` function distributes over a list, a matrix, or an equation. See `sign` and `distribute_over`.

Categories: [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) ·

Function: **truncate** (x)

When x is a real number, return the closest integer to x not greater in absolute value than x. Evaluation of x is similar to `floor` and `ceiling`.

The `truncate` function distributes over lists, matrices and equations. See `distribute_over`.

Categories: [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) ·

---

Next: [Combinatorial Functions](#^Combinatorial-Functions), Previous: [Functions for Numbers](#^Functions-for-Numbers), Up: [Elementary Functions](maxima_singlepage_split_009.html#Elementary-Functions) \[[Contents](maxima_singlepage_split_000.html#SEC_Contents "Table of contents")\]\[[Index](maxima_singlepage_split_102.html#Function-and-Variable-Index "Index")\]

### 10.2 Functions for Complex Numbers ^Functions-for-Complex-Numbers-1

Function: **cabs** (expr)

Calculates the absolute value of an expression representing a complex number. Unlike the function `abs`, the `cabs` function always decomposes its argument into a real and an imaginary part. If `x` and `y` represent real variables or expressions, the `cabs` function calculates the absolute value of `x + %i*y` as

```undefined
(%i1) cabs (1);
(%o1)                           1
```

```undefined
(%i2) cabs (1 + %i);
(%o2)                        sqrt(2)
```

```undefined
(%i3) cabs (exp (%i));
(%o3)                           1
```

```undefined
(%i4) cabs (exp (%pi * %i));
(%o4)                           1
```

```undefined
(%i5) cabs (exp (3/2  %pi  %i));
(%o5)                           1
```

```undefined
(%i6) cabs (17 * exp (2 * %i));
(%o6)                          17
```

If `cabs` returns a noun form this most commonly is caused by some properties of the variables involved not being known:

```undefined
(%i1) cabs (a+%i*b);
                                2    2
(%o1)                     sqrt(b  + a )
```

```undefined
(%i2) declare(a,real,b,real);
(%o2)                         done
```

```undefined
(%i3) cabs (a+%i*b);
                                2    2
(%o3)                     sqrt(b  + a )
```

```undefined
(%i4) assume(a>0,b>0);
(%o4)                    [a > 0, b > 0]
```

```undefined
(%i5) cabs (a+%i*b);
                                2    2
(%o5)                     sqrt(b  + a )
```

The `cabs` function can use known properties like symmetry properties of complex functions to help it calculate the absolute value of an expression. If such identities exist, they can be advertised to `cabs` using function properties. The symmetries that `cabs` understands are: mirror symmetry, conjugate function and complex characteristic.

`cabs` is a verb function and is not suitable for symbolic calculations. For such calculations (including integration, differentiation and taking limits of expressions containing absolute values), use `abs`.

The result of `cabs` can include the absolute value function, `abs`, and the arc tangent, `atan2`.

When applied to a list or matrix, `cabs` automatically distributes over the terms. Similarly, it distributes over both sides of an equation.

For further ways to compute with complex numbers, see the functions `rectform`, `realpart`, `imagpart`, `carg`, `conjugate` and `polarform`.

Examples:

Examples with `sqrt` and `sin`.

```undefined
(%i1) cabs(sqrt(1+%i*x));
                             2     1/4
(%o1)                      (x  + 1)
```

```undefined
(%i2) cabs(sin(x+%i*y));
                    2        2         2        2
(%o2)       sqrt(cos (x) sinh (y) + sin (x) cosh (y))
```

The error function, `erf`, has mirror symmetry, which is used here in the calculation of the absolute value with a complex argument:

```undefined
(%i1) cabs(erf(x+%i*y));
                                          2
           (erf(%i y + x) - erf(%i y - x))
(%o1) sqrt(--------------------------------
                          4
                                                               2
                              (- erf(%i y + x) - erf(%i y - x))
                            - ----------------------------------)
                                              4
```

Maxima knows complex identities for the Bessel functions, which allow it to compute the absolute value for complex arguments. Here is an example for `bessel_j`.

```undefined
(%i1) cabs(bessel_j(1,%i));
(%o1)                    bessel_i(1, 1)
```

Categories: [Complex variables](maxima_singlepage_split_102.html#Category_003a-Complex-variables) ·

Function: **carg** (z)

Returns the complex argument of z. The complex argument is an angle `theta` in `(-%pi, %pi]` such that `r exp (theta %i) = z` where `r` is the magnitude of z.

`carg` is a computational function, not a simplifying function.

See also `abs` (complex magnitude), `polarform`, `rectform`, `realpart`, and `imagpart`.

Examples:

```undefined
(%i1) carg (1);
(%o1)                           0
```

```undefined
(%i2) carg (1 + %i);
                               %pi
(%o2)                          ---
                                4
```

```undefined
(%i3) carg (exp (%i));
                               sin(1)
(%o3)                     atan(------)
                               cos(1)
```

```undefined
(%i4) carg (exp (%pi * %i));
(%o4)                          %pi
```

```undefined
(%i5) carg (exp (3/2  %pi  %i));
                                %pi
(%o5)                         - ---
                                 2
```

```undefined
(%i6) carg (17 * exp (2 * %i));
                            sin(2)
(%o6)                  atan(------) + %pi
                            cos(2)
```

If `carg` returns a noun form this most commonly is caused by some properties of the variables involved not being known:

```undefined
(%i1) carg (a+%i*b);
(%o1)                      atan2(b, a)
```

```undefined
(%i2) declare(a,real,b,real);
(%o2)                         done
```

```undefined
(%i3) carg (a+%i*b);
(%o3)                      atan2(b, a)
```

```undefined
(%i4) assume(a>0,b>0);
(%o4)                    [a > 0, b > 0]
```

```undefined
(%i5) carg (a+%i*b);
                                  b
(%o5)                        atan(-)
                                  a
```

Categories: [Complex variables](maxima_singlepage_split_102.html#Category_003a-Complex-variables) ·

Function: **conjugate** (x)

Returns the complex conjugate of x.

```undefined
(%i1) declare ([aa, bb], real, cc, complex, ii, imaginary);
(%o1)                         done
```

```undefined
(%i2) conjugate (aa + bb*%i);
(%o2)                      aa - %i bb
```

```undefined
(%i3) conjugate (cc);
(%o3)                     conjugate(cc)
```

```undefined
(%i4) conjugate (ii);
(%o4)                         - ii
```

```undefined
(%i5) conjugate (xx + yy);
(%o5)                        yy + xx
```

Categories: [Complex variables](maxima_singlepage_split_102.html#Category_003a-Complex-variables) ·

Function: **imagpart** (expr)

Returns the imaginary part of the expression expr.

`imagpart` is a computational function, not a simplifying function.

See also `abs`, `carg`, `polarform`, `rectform`, and `realpart`.

Example:

```undefined
(%i1) imagpart (a+b*%i);
(%o1)                           b
```

```undefined
(%i2) imagpart (1+sqrt(2)*%i);
(%o2)                        sqrt(2)
```

```undefined
(%i3) imagpart (1);
(%o3)                           0
```

```undefined
(%i4) imagpart (sqrt(2)*%i);
(%o4)                        sqrt(2)
```

Categories: [Complex variables](maxima_singlepage_split_102.html#Category_003a-Complex-variables) ·

Function: **polarform** (expr)

Returns an expression `r %e^(%i theta)` equivalent to expr, such that `r` and `theta` are purely real.

Example:

```undefined
(%i1) polarform(a+b*%i);
                       2    2    %i atan2(b, a)
(%o1)            sqrt(b  + a ) %e
```

```undefined
(%i2) polarform(1+%i);
                                  %i %pi
                                  ------
                                    4
(%o2)                   sqrt(2) %e
```

```undefined
(%i3) polarform(1+2*%i);
                                %i atan(2)
(%o3)                 sqrt(5) %e
```

Categories: [Complex variables](maxima_singlepage_split_102.html#Category_003a-Complex-variables) · [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) ·

Function: **realpart** (expr)

Returns the real part of expr. `realpart` and `imagpart` will work on expressions involving trigonometric and hyperbolic functions, as well as square root, logarithm, and exponentiation.

Example:

```undefined
(%i1) realpart (a+b*%i);
(%o1)                           a
```

```undefined
(%i2) realpart (1+sqrt(2)*%i);
(%o2)                           1
```

```undefined
(%i3) realpart (sqrt(2)*%i);
(%o3)                           0
```

```undefined
(%i4) realpart (1);
(%o4)                           1
```

Categories: [Complex variables](maxima_singlepage_split_102.html#Category_003a-Complex-variables) ·

Function: **rectform** (expr)

Returns an expression `a + b %i` equivalent to expr, such that a and b are purely real.

Example:

```undefined
(%i1) rectform(sqrt(2)*%e^(%i*%pi/4));
(%o1)                        %i + 1
```

```undefined
(%i2) rectform(sqrt(b^2+a^2)*%e^(%i*atan2(b, a)));
(%o2)                       %i b + a
```

```undefined
(%i3) rectform(sqrt(5)*%e^(%i*atan(2)));
(%o3)                       2 %i + 1
```

Categories: [Complex variables](maxima_singlepage_split_102.html#Category_003a-Complex-variables) ·

---

Next: [Root, Exponential and Logarithmic Functions](#^Root-Exponential-and-Logarithmic-Functions), Previous: [Functions for Complex Numbers](#^Functions-for-Complex-Numbers), Up: [Elementary Functions](maxima_singlepage_split_009.html#Elementary-Functions) \[[Contents](maxima_singlepage_split_000.html#SEC_Contents "Table of contents")\]\[[Index](maxima_singlepage_split_102.html#Function-and-Variable-Index "Index")\]

### 10.3 Combinatorial Functions

Operator: **!!**

The double factorial operator.

For an integer, float, or rational number `n`, `n!!` evaluates to the product `n (n-2) (n-4) (n-6) ... (n - 2 (k-1))` where `k` is equal to `entier (n/2)`, that is, the largest integer less than or equal to `n/2`. Note that this definition does not coincide with other published definitions for arguments which are not integers.

For an even (or odd) integer `n`, `n!!` evaluates to the product of all the consecutive even (or odd) integers from 2 (or 1) through `n` inclusive.

For an argument `n` which is not an integer, float, or rational, `n!!` yields a noun form `genfact (n, n/2, 2)`.

Categories: [Gamma and factorial functions](maxima_singlepage_split_102.html#Category_003a-Gamma-and-factorial-functions) · [Operators](maxima_singlepage_split_102.html#Category_003a-Operators) ·

Function: **binomial** (x, y)

The binomial coefficient `x!/(y! (x - y)!)`. If x and y are integers, then the numerical value of the binomial coefficient is computed. If y, or x - y, is an integer, the binomial coefficient is expressed as a polynomial.

Examples:

```undefined
(%i1) binomial (11, 7);
(%o1)                          330
```

```undefined
(%i2) 11!  7!  (11 - 7)!;
(%o2)                          330
```

```undefined
(%i3) binomial (x, 7);
        (x - 6) (x - 5) (x - 4) (x - 3) (x - 2) (x - 1) x
(%o3)   -------------------------------------------------
                              5040
```

```undefined
(%i4) binomial (x + 7, x);
      (x + 1) (x + 2) (x + 3) (x + 4) (x + 5) (x + 6) (x + 7)
(%o4) -------------------------------------------------------
                               5040
```

```undefined
(%i5) binomial (11, y);
(%o5)                    binomial(11, y)
```

Categories: [Number theory](maxima_singlepage_split_102.html#Category_003a-Number-theory) ·

Function: **factcomb** (expr)

Tries to combine the coefficients of factorials in expr with the factorials themselves by converting, for example, `(n + 1)*n!` into `(n + 1)!`.

`sumsplitfact` if set to `false` will cause `minfactorial` to be applied after a `factcomb`.

Example:

```undefined
(%i1) sumsplitfact;
(%o1)                         true
```

```undefined
(%i2) (n + 1)*(n + 1)*n!;
                                  2
(%o2)                      (n + 1)  n!
```

```undefined
(%i3) factcomb (%);
(%o3)                  (n + 2)! - (n + 1)!
```

```undefined
(%i4) sumsplitfact: not sumsplitfact;
(%o4)                         false
```

```undefined
(%i5) (n + 1)*(n + 1)*n!;
                                  2
(%o5)                      (n + 1)  n!
```

```undefined
(%i6) factcomb (%);
(%o6)                 n (n + 1)! + (n + 1)!
```

Categories: [Gamma and factorial functions](maxima_singlepage_split_102.html#Category_003a-Gamma-and-factorial-functions) ·

Function: **factorial**

Operator: **!**

Represents the factorial function. Maxima treats `factorial (x)` the same as `x!`.

For any complex number `x`, except for negative integers, `x!` is defined as `gamma(x+1)`.

For an integer `x`, `x!` simplifies to the product of the integers from 1 to `x` inclusive. `0!` simplifies to 1. For a real or complex number in float or bigfloat precision `x`, `x!` simplifies to the value of `gamma (x+1)`. For `x` equal to `n/2` where `n` is an odd integer, `x!` simplifies to a rational factor times `sqrt (%pi)` (since `gamma (1/2)` is equal to `sqrt (%pi)`).

The option variables `factlim` and `gammalim` control the numerical evaluation of factorials for integer and rational arguments. The functions `minfactorial` and `factcomb` simplifies expressions containing factorials.

The functions `gamma`, `bffac`, and `cbffac` are varieties of the gamma function. `bffac` and `cbffac` are called internally by `gamma` to evaluate the gamma function for real and complex numbers in bigfloat precision.

`makegamma` substitutes `gamma` for factorials and related functions.

Maxima knows the derivative of the factorial function and the limits for specific values like negative integers.

The option variable `factorial_expand` controls the simplification of expressions like `(n+x)!`, where `n` is an integer.

See also `binomial`.

The factorial of an integer is simplified to an exact number unless the operand is greater than `factlim`. The factorial for real and complex numbers is evaluated in float or bigfloat precision.

```undefined
(%i1) factlim : 10;
(%o1)                          10
```

```undefined
(%i2) [0!, (7/2)!, 8!, 20!];
                     105 sqrt(%pi)
(%o2)            [1, -------------, 40320, 20!]
                          16
```

```undefined
(%i3) [4,77!, (1.0+%i)!];
(%o3) [4, 77!, 0.3430658398165453 %i + 0.6529654964201667]
```

```undefined
(%i4) [2.86b0!, (1.0b0+%i)!];
(%o4) [5.046635586910012b0, 3.430658398165454b-1 %i
                                          + 6.529654964201667b-1]
```

The factorial of a known constant, or general expression is not simplified. Even so it may be possible to simplify the factorial after evaluating the operand.

```undefined
(%i1) [(%i + 1)!, %pi!, %e!, (cos(1) + sin(1))!];
(%o1)      [(%i + 1)!, %pi!, %e!, (sin(1) + cos(1))!]
```

```undefined
(%i2) ev (%, numer, %enumer);
(%o2) [0.3430658398165453 %i + 0.6529654964201667, 
         7.188082728976031, 4.260820476357003, 1.227580202486819]
```

Factorials are simplified, not evaluated. Thus `x!` may be replaced even in a quoted expression.

```undefined
(%i1) '([0!, (7/2)!, 4.77!, 8!, 20!]);
          105 sqrt(%pi)
(%o1) [1, -------------, 81.44668037931197, 40320, 
               16
                                             2432902008176640000]
```

Maxima knows the derivative of the factorial function.

```undefined
(%i1) diff(x!,x);
(%o1)                    x! psi (x + 1)
                               0
```

The option variable `factorial_expand` controls expansion and simplification of expressions with the factorial function.

```undefined
(%i1) (n+1)!/n!,factorial_expand:true;
(%o1)                         n + 1
```

Categories: [Gamma and factorial functions](maxima_singlepage_split_102.html#Category_003a-Gamma-and-factorial-functions) · [Operators](maxima_singlepage_split_102.html#Category_003a-Operators) ·

Option variable: **factlim**

Default value: 100000

`factlim` specifies the highest factorial which is automatically expanded. If it is -1 then all integers are expanded.

Categories: [Gamma and factorial functions](maxima_singlepage_split_102.html#Category_003a-Gamma-and-factorial-functions) ·

Option variable: **factorial_expand**

Default value: false

The option variable `factorial_expand` controls the simplification of expressions like `(x+n)!`, where `n` is an integer. See `factorial` for an example.

Categories: [Gamma and factorial functions](maxima_singlepage_split_102.html#Category_003a-Gamma-and-factorial-functions) ·

Function: **genfact** (x, y, z)

Returns the generalized factorial, defined as `x (x-z) (x - 2 z) ... (x - (y - 1) z)`. Thus, when x is an integer, `genfact (x, x, 1) = x!` and `genfact (x, x/2, 2) = x!!`.

Categories: [Gamma and factorial functions](maxima_singlepage_split_102.html#Category_003a-Gamma-and-factorial-functions) ·

Function: **minfactorial** (expr)

Examines expr for occurrences of two factorials which differ by an integer. `minfactorial` then turns one into a polynomial times the other.

```undefined
(%i1) n!/(n+2)!;
                               n!
(%o1)                       --------
                            (n + 2)!
```

```undefined
(%i2) minfactorial (%);
                                1
(%o2)                    ---------------
                         (n + 1) (n + 2)
```

Categories: [Number theory](maxima_singlepage_split_102.html#Category_003a-Number-theory) ·

Option variable: **sumsplitfact**

Default value: `true`

When `sumsplitfact` is `false`, `minfactorial` is applied after a `factcomb`.

```undefined
(%i1) sumsplitfact;
(%o1)                         true
```

```undefined
(%i2) n!/(n+2)!;
                               n!
(%o2)                       --------
                            (n + 2)!
```

```undefined
(%i3) factcomb(%);
                               n!
(%o3)                       --------
                            (n + 2)!
```

```undefined
(%i4) sumsplitfact: not sumsplitfact ;
(%o4)                         false
```

```undefined
(%i5) n!/(n+2)!;
                               n!
(%o5)                       --------
                            (n + 2)!
```

```undefined
(%i6) factcomb(%);
                                1
(%o6)                    ---------------
                         (n + 1) (n + 2)
```

Categories: [Gamma and factorial functions](maxima_singlepage_split_102.html#Category_003a-Gamma-and-factorial-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

---

Next: [Trigonometric Functions](#^Trigonometric-Functions), Previous: [Combinatorial Functions](#^Combinatorial-Functions), Up: [Elementary Functions](maxima_singlepage_split_009.html#Elementary-Functions) \[[Contents](maxima_singlepage_split_000.html#SEC_Contents "Table of contents")\]\[[Index](maxima_singlepage_split_102.html#Function-and-Variable-Index "Index")\]

### 10.4 Root, Exponential and Logarithmic Functions

Option variable: **%e_to_numlog**

Default value: `false`

When `true`, `r` some rational number, and `x` some expression, `%e^(r*log(x))` will be simplified into `x^r` . It should be noted that the `radcan` command also does this transformation, and more complicated transformations of this ilk as well. The `logcontract` command "contracts" expressions containing `log`.

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

Option variable: **%emode**

Default value: `true`

When `%emode` is `true`, `%e^(%pi %i x)` is simplified as follows.

`%e^(%pi %i x)` simplifies to `cos (%pi x) + %i sin (%pi x)` if `x` is a floating point number, an integer, or a multiple of 1/2, 1/3, 1/4, or 1/6, and then further simplified.

For other numerical `x`, `%e^(%pi %i x)` simplifies to `%e^(%pi %i y)` where `y` is `x - 2 k` for some integer `k` such that `abs(y) < 1`.

When `%emode` is `false`, no special simplification of `%e^(%pi %i x)` is carried out.

```undefined
(%i1) %emode;
(%o1)                         true
```

```undefined
(%i2) %e^(%pi*%i*1);
(%o2)                          - 1
```

```undefined
(%i3) %e^(%pi*%i*216/144);
(%o3)                         - %i
```

```undefined
(%i4) %e^(%pi*%i*192/144);
                          sqrt(3) %i   1
(%o4)                   - ---------- - -
                              2        2
```

```undefined
(%i5) %e^(%pi*%i*180/144);
                           %i         1
(%o5)                  - ------- - -------
                         sqrt(2)   sqrt(2)
```

```undefined
(%i6) %e^(%pi*%i*120/144);
                          %i   sqrt(3)
(%o6)                     -- - -------
                          2       2
```

```undefined
(%i7) %e^(%pi*%i*121/144);
                            121 %i %pi
                            ----------
                               144
(%o7)                     %e
```

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

Option variable: **%enumer**

Default value: `false`

When `%enumer` is `true`, `%e` is replaced by its numeric value 2.718… whenever `numer` is `true`.

When `%enumer` is `false`, this substitution is carried out only if the exponent in `%e^x` evaluates to a number.

See also `ev` and `numer`.

```undefined
(%i1) %enumer;
(%o1)                         false
```

```undefined
(%i2) numer;
(%o2)                         false
```

```undefined
(%i3) 2*%e;
(%o3)                         2 %e
```

```undefined
(%i4) %enumer: not %enumer;
(%o4)                         true
```

```undefined
(%i5) 2*%e;
(%o5)                         2 %e
```

```undefined
(%i6) numer: not numer;
(%o6)                         true
```

```undefined
(%i7) 2*%e;
(%o7)                   5.43656365691809
```

```undefined
(%i8) 2*%e^1;
(%o8)                   5.43656365691809
```

```undefined
(%i9) 2*%e^x;
                                         x
(%o9)                 2 2.718281828459045
```

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) · [Evaluation flags](maxima_singlepage_split_102.html#Category_003a-Evaluation-flags) ·

Function: **exp** (x)

Represents the exponential function. Instances of `exp (x)` in input are simplified to `%e^x`; `exp` does not appear in simplified expressions.

`demoivre` if `true` causes `%e^(a + b %i)` to simplify to `%e^(a (cos(b) + %i sin(b)))` if `b` is free of `%i`. See `demoivre`.

`%emode`, when `true`, causes `%e^(%pi %i x)` to be simplified. See `%emode`.

`%enumer`, when `true` causes `%e` to be replaced by 2.718… whenever `numer` is `true`. See `%enumer`.

```undefined
(%i1) demoivre;
(%o1)                         false
```

```undefined
(%i2) %e^(a + b*%i);
                             %i b + a
(%o2)                      %e
```

```undefined
(%i3) demoivre: not demoivre;
(%o3)                         true
```

```undefined
(%i4) %e^(a + b*%i);
                      a
(%o4)               %e  (%i sin(b) + cos(b))
```

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) ·

Function: **li** \[s\] (z)

Represents the polylogarithm function of order s and argument z, defined by the infinite series

$$ {\rm Li}_s \left(z\right) = \sum_{k=1}^\infty {z^k \over k^s} $$

`li[1](z)` is $-\log(1 - z).$ `li[2]` and `li[3]` are the dilogarithm and trilogarithm functions, respectively.

When the order is 1, the polylogarithm simplifies to `- log (1 - z)`, which in turn simplifies to a numerical value if z is a real or complex floating point number or the `numer` evaluation flag is present.

When the order is 2 or 3, the polylogarithm simplifies to a numerical value if z is a real floating point number or the `numer` evaluation flag is present.

Examples:

```undefined
(%i1) assume (x > 0);
(%o1)                        [x > 0]
```

```undefined
(%i2) integrate ((log (1 - t)) / t, t, 0, x);
(%o2)                       - li (x)
                                2
```

```undefined
(%i3) li[4](1);
                                 4
                              %pi
(%o3)                         ----
                               90
```

```undefined
(%i4) li[5](1);
(%o4)                        zeta(5)
```

```undefined
(%i5) li[2](1/2);
                            2      2
                         %pi    log (2)
(%o5)                    ---- - -------
                          12       2
```

```undefined
(%i6) li[2](%i);
                                        2
                                     %pi
(%o6)                  %catalan %i - ----
                                      48
```

```undefined
(%i7) li[2](1+%i);
                                  2
               %i %pi log(2)   %pi
(%o7)          ------------- + ---- + %catalan %i
                     4          16
```

```undefined
(%i8) li [2] (7);
(%o8)                        li (7)
                               2
```

```undefined
(%i9) li [2] (7), numer;
(%o9)      1.2482731820994244 - 6.1132570288179915 %i
```

```undefined
(%i10) li [3] (7);
(%o10)                       li (7)
                               3
```

```undefined
(%i11) li [2] (7), numer;
(%o11)     1.2482731820994244 - 6.1132570288179915 %i
```

```undefined
(%i12) L : makelist (i / 4.0, i, 0, 8);
(%o12)  [0.0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
```

```undefined
(%i13) map (lambda ([x], li [2] (x)), L);
(%o13) [0.0, 0.2676526390827326, 0.5822405264650125, 
0.978469392930306, 1.6449340668482264, 
2.1901770114416452 - 0.7010261415046585 %i, 
2.3743952702724798 - 1.2738062049196004 %i, 
2.448686765338203 - 1.7580848482107874 %i, 
2.4674011002723395 - 2.177586090303602 %i]
```

```undefined
(%i14) map (lambda ([x], li [3] (x)), L);
(%o14) [0.0, 0.25846139579657335, 0.5372131936080402, 
0.8444258088622044, 1.2020569031595942, 
1.6428668813178295 - 0.07821473138972386 %i, 
2.0608775073202805 - 0.258241985293288 %i, 
2.433418898226189 - 0.49192601879440423 %i, 
2.762071906228924 - 0.7546938294602477 %i]
```

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) ·

Function: **log** (x)

Represents the natural (base _$e$_) logarithm of x.

Maxima does not have a built-in function for the base 10 logarithm or other bases. `log10(x) := log(x) / log(10)` is a useful definition.

Simplification and evaluation of logarithms is governed by several global flags:

`logexpand`

causes `log(a^b)` to become `b*log(a)`. If it is set to `all`, `log(a*b)` will also simplify to `log(a)+log(b)`. If it is set to `super`, then `log(a/b)` will also simplify to `log(a)-log(b)` for rational numbers `a/b`, `a#1`. (`log(1/b)`, for `b` integer, always simplifies.) If it is set to `false`, all of these simplifications will be turned off.

`logsimp`

if `false` then no simplification of `%e` to a power containing `log`’s is done.

`lognegint`

if `true` implements the rule `log(-n) -> log(n)+%i*%pi` for `n` a positive integer.

`%e_to_numlog`

when `true`, `r` some rational number, and `x` some expression, the expression `%e^(r*log(x))` will be simplified into `x^r`. It should be noted that the `radcan` command also does this transformation, and more complicated transformations of this as well. The `logcontract` command "contracts" expressions containing `log`.

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) ·

Option variable: **logabs**

Default value: `false`

When doing indefinite integration where logs are generated, _e.g._ `integrate(1/x,x)`, the answer is given in terms of `log(abs(...))` if `logabs` is `true`, but in terms of `log(...)` if `logabs` is `false`. For definite integration, the `logabs:true` setting is used, because here "evaluation" of the indefinite integral at the endpoints is often needed.

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) · [Integral calculus](maxima_singlepage_split_102.html#Category_003a-Integral-calculus) · [Global flags](maxima_singlepage_split_102.html#Category_003a-Global-flags) ·

Function: **logarc** (expr)

The function `logarc(expr)` carries out the replacement of inverse circular and hyperbolic functions with equivalent logarithmic functions for an expression expr without setting the global variable `logarc`.

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) · [Simplification functions](maxima_singlepage_split_102.html#Category_003a-Simplification-functions) ·

Option variable: **logarc**

When the global variable `logarc` is `true`, inverse circular and hyperbolic functions are replaced by equivalent logarithmic functions. The default value of `logarc` is `false`.

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) · [Simplification functions](maxima_singlepage_split_102.html#Category_003a-Simplification-functions) ·

Option variable: **logconcoeffp**

Default value: `false`

Controls which coefficients are contracted when using `logcontract`. It may be set to the name of a predicate function of one argument. _E.g._ if you like to generate SQRTs, you can do `logconcoeffp:'logconfun$ logconfun(m):=featurep(m,integer) or ratnump(m)$` . Then `logcontract(1/2*log(x));` will give `log(sqrt(x))`.

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

Function: **logcontract** (expr)

Recursively scans the expression expr, transforming subexpressions of the form `a1*log(b1) + a2*log(b2) + c` into `log(ratsimp(b1^a1 * b2^a2)) + c`

```undefined
(%i1) 2*(a*log(x) + 2alog(y))$
```

```undefined
(%i2) logcontract(%);
                                 2  4
(%o2)                     a log(x  y )
```

The declaration `declare(n,integer)` causes `logcontract(2an*log(x))` to simplify to `a*log(x^(2*n))`. The coefficients that "contract" in this manner are those such as the 2 and the `n` here which satisfy `featurep(coeff,integer)`. The user can control which coefficients are contracted by setting the option `logconcoeffp` to the name of a predicate function of one argument. _E.g._ if you like to generate SQRTs, you can do `logconcoeffp:'logconfun$ logconfun(m):=featurep(m,integer) or ratnump(m)$` . Then `logcontract(1/2*log(x));` will give `log(sqrt(x))`.

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) ·

Option variable: **logexpand**

Default value: `true`

If `true`, that is the default value, causes `log(a^b)` to become `b*log(a)`. If it is set to `all`, `log(a*b)` will also simplify to `log(a)+log(b)`. If it is set to `super`, then `log(a/b)` will also simplify to `log(a)-log(b)` for rational numbers `a/b`, `a#1`. (`log(1/b)`, for integer `b`, always simplifies.) If it is set to `false`, all of these simplifications will be turned off.

When `logexpand` is set to `all` or `super`, the logarithm of a product expression simplifies to a summation of logarithms.

Examples:

When `logexpand` is `true`, `log(a^b)` simplifies to `b*log(a)`.

```undefined
(%i1) log(n^2), logexpand=true;
(%o1)                       2 log(n)
```

When `logexpand` is `all`, `log(a*b)` simplifies to `log(a)+log(b)`.

```undefined
(%i1) log(10*x), logexpand=all;
(%o1)                   log(x) + log(10)
```

When `logexpand` is `super`, `log(a/b)` simplifies to `log(a)-log(b)` for rational numbers `a/b` with `a#1`.

```undefined
(%i1) log(a/(n + 1)), logexpand=super;
(%o1)                  log(a) - log(n + 1)
```

When `logexpand` is set to `all` or `super`, the logarithm of a product expression simplifies to a summation of logarithms.

```undefined
(%i1) my_product : product (X(i), i, 1, n);
                             n
                           _____
                           |   |
(%o1)                      |   | X(i)
                           |   |
                           i = 1
```

```undefined
(%i2) log(my_product), logexpand=all;
                          n
                         ____
                         \
(%o2)                     >    log(X(i))
                         /
                         ----
                         i = 1
```

```undefined
(%i3) log(my_product), logexpand=super;
                          n
                         ____
                         \
(%o3)                     >    log(X(i))
                         /
                         ----
                         i = 1
```

When `logexpand` is `false`, these simplifications are disabled.

```undefined
(%i1) logexpand : false $
```

```undefined
(%i2) log(n^2);
                                  2
(%o2)                        log(n )
```

```undefined
(%i3) log(10*x);
(%o3)                       log(10 x)
```

```undefined
(%i4) log(a/(n + 1));
                                 a
(%o4)                      log(-----)
                               n + 1
```

```undefined
(%i5) log ('product (X(i), i, 1, n));
                               n
                             _____
                             |   |
(%o5)                    log(|   | X(i))
                             |   |
                             i = 1
```

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

Option variable: **lognegint**

Default value: `false`

If `true` implements the rule `log(-n) -> log(n)+%i*%pi` for `n` a positive integer.

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

Option variable: **logsimp**

Default value: `true`

If `false` then no simplification of `%e` to a power containing `log`’s is done.

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

Function: **plog** (x)

Represents the principal branch of the complex-valued natural logarithm with `-%pi < carg(x) <= +%pi` .

Categories: [Exponential and logarithm functions](maxima_singlepage_split_102.html#Category_003a-Exponential-and-logarithm-functions) · [Complex variables](maxima_singlepage_split_102.html#Category_003a-Complex-variables) ·

Function: **sqrt** (x)

The square root of x. It is represented internally by `x^(1/2)`. See also `rootscontract` and `radexpand`.

Categories: [Mathematical functions](maxima_singlepage_split_102.html#Category_003a-Mathematical-functions) ·

---

Next: [Random Numbers](#^Random-Numbers), Previous: [Root, Exponential and Logarithmic Functions](#^Root-Exponential-and-Logarithmic-Functions), Up: [Elementary Functions](maxima_singlepage_split_009.html#Elementary-Functions) \[[Contents](maxima_singlepage_split_000.html#SEC_Contents "Table of contents")\]\[[Index](maxima_singlepage_split_102.html#Function-and-Variable-Index "Index")\]

### 10.5 Trigonometric Functions

- [Introduction to Trigonometric](#^Introduction-to-Trigonometric)
- [Functions and Variables for Trigonometric](#^Functions-and-Variables-for-Trigonometric)

---

Next: [Functions and Variables for Trigonometric](#^Functions-and-Variables-for-Trigonometric), Previous: [Trigonometric Functions](#^Trigonometric-Functions), Up: [Trigonometric Functions](#^Trigonometric-Functions) \[[Contents](maxima_singlepage_split_000.html#SEC_Contents "Table of contents")\]\[[Index](maxima_singlepage_split_102.html#Function-and-Variable-Index "Index")\]

#### 10.5.1 Introduction to Trigonometric

Maxima has many trigonometric functions defined. Not all trigonometric identities are programmed, but it is possible for the user to add many of them using the pattern matching capabilities of the system. The trigonometric functions defined in Maxima are: `acos`, `acosh`, `acot`, `acoth`, `acsc`, `acsch`, `asec`, `asech`, `asin`, `asinh`, `atan`, `atanh`, `cos`, `cosh`, `cot`, `coth`, `csc`, `csch`, `sec`, `sech`, `sin`, `sinh`, `tan`, and `tanh`. There are a number of commands especially for handling trigonometric functions, see `trigexpand`, `trigreduce`, and the switch `trigsign`. Three share packages extend the simplification rules built into Maxima, `ntrig`, `atrig1` and [Introduction to trigtools](maxima_singlepage_split_097.html#Introduction-to-trigtools). Do `describe(command)` for details.

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

---

Previous: [Introduction to Trigonometric](#^Introduction-to-Trigonometric), Up: [Trigonometric Functions](#^Trigonometric-Functions) \[[Contents](maxima_singlepage_split_000.html#SEC_Contents "Table of contents")\]\[[Index](maxima_singlepage_split_102.html#Function-and-Variable-Index "Index")\]

#### 10.5.2 Functions and Variables for Trigonometric

- [Trigonometric and Hyperbolic Functions](#^Trigonometric-and-Hyperbolic-Functions)
- [Options Controlling Simplification](#^Options-Controlling-Simplification)
- [Explicit Simplifications Using Identities](#^Explicit-Simplifications-Using-Identities)
- [Additional Functions](#^Additional-Functions)

---

Next: [Options Controlling Simplification](#^Options-Controlling-Simplification), Previous: [Functions and Variables for Trigonometric](#^Functions-and-Variables-for-Trigonometric), Up: [Functions and Variables for Trigonometric](#^Functions-and-Variables-for-Trigonometric) \[[Contents](maxima_singlepage_split_000.html#SEC_Contents "Table of contents")\]\[[Index](maxima_singlepage_split_102.html#Function-and-Variable-Index "Index")\]

#### 10.5.2.1 Trigonometric and Hyperbolic Functions

Function: **acos** (x)

– Arc Cosine.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

Function: **acosh** (x)

– Hyperbolic Arc Cosine.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Hyperbolic functions](maxima_singlepage_split_102.html#Category_003a-Hyperbolic-functions) ·

Function: **acot** (x)

– Arc Cotangent.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

Function: **acoth** (x)

– Hyperbolic Arc Cotangent.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Hyperbolic functions](maxima_singlepage_split_102.html#Category_003a-Hyperbolic-functions) ·

Function: **acsc** (x)

– Arc Cosecant.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

Function: **acsch** (x)

– Hyperbolic Arc Cosecant.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Hyperbolic functions](maxima_singlepage_split_102.html#Category_003a-Hyperbolic-functions) ·

Function: **asec** (x)

– Arc Secant.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

Function: **asech** (x)

– Hyperbolic Arc Secant.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Hyperbolic functions](maxima_singlepage_split_102.html#Category_003a-Hyperbolic-functions) ·

Function: **asin** (x)

– Arc Sine.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

Function: **asinh** (x)

– Hyperbolic Arc Sine.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Hyperbolic functions](maxima_singlepage_split_102.html#Category_003a-Hyperbolic-functions) ·

Function: **atan** (x)

– Arc Tangent.

See also `atan2`.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

Function: **atan2** (y, x)

– yields the value of $\tan^{-1}(y/x)$ in the interval $-\pi$ to $\pi$ taking into consideration the quadrant of the point $(x,y).$

Along the branch cut with _$y = 0$_ and _$x < 0$_, `atan2` is continuous with the second quadrant. See also `atan`.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

Function: **atanh** (x)

– Hyperbolic Arc Tangent.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Hyperbolic functions](maxima_singlepage_split_102.html#Category_003a-Hyperbolic-functions) ·

Function: **cos** (x)

– Cosine.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

Function: **cosh** (x)

– Hyperbolic Cosine.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Hyperbolic functions](maxima_singlepage_split_102.html#Category_003a-Hyperbolic-functions) ·

Function: **cot** (x)

– Cotangent.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

Function: **coth** (x)

– Hyperbolic Cotangent.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Hyperbolic functions](maxima_singlepage_split_102.html#Category_003a-Hyperbolic-functions) ·

Function: **csc** (x)

– Cosecant.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

Function: **csch** (x)

– Hyperbolic Cosecant.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Hyperbolic functions](maxima_singlepage_split_102.html#Category_003a-Hyperbolic-functions) ·

Function: **sec** (x)

– Secant.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

Function: **sech** (x)

– Hyperbolic Secant.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Hyperbolic functions](maxima_singlepage_split_102.html#Category_003a-Hyperbolic-functions) ·

Function: **sin** (x)

– Sine.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

Function: **sinh** (x)

– Hyperbolic Sine.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Hyperbolic functions](maxima_singlepage_split_102.html#Category_003a-Hyperbolic-functions) ·

Function: **tan** (x)

– Tangent.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) ·

Function: **tanh** (x)

– Hyperbolic Tangent.

For variables that control simplification see [%piargs](#^g_t_0025piargs), [%iargs](#^g_t_0025iargs), [halfangles](#^halfangles), [triginverses](#^triginverses), and [trigsign](#^trigsign).

Categories: [Hyperbolic functions](maxima_singlepage_split_102.html#Category_003a-Hyperbolic-functions) ·

---

Next: [Explicit Simplifications Using Identities](#^Explicit-Simplifications-Using-Identities), Previous: [Trigonometric and Hyperbolic Functions](#^Trigonometric-and-Hyperbolic-Functions), Up: [Functions and Variables for Trigonometric](#^Functions-and-Variables-for-Trigonometric) \[[Contents](maxima_singlepage_split_000.html#SEC_Contents "Table of contents")\]\[[Index](maxima_singlepage_split_102.html#Function-and-Variable-Index "Index")\]

#### 10.5.2.2 Options Controlling Simplification

Option variable: **%piargs**

Default value: `true`

When `%piargs` is `true`, trigonometric functions are simplified to algebraic constants when the argument is an integer multiple of $\pi,$ $\pi/2,$ $\pi/4,$ or $\pi/6.$

Maxima knows some identities which can be applied when $\pi,$ etc., are multiplied by an integer variable (that is, a symbol declared to be integer).

Examples:

```undefined
(%i1) %piargs : false$
```

```undefined
(%i2) [sin (%pi), sin (%pi/2), sin (%pi/3)];
                                %pi       %pi
(%o2)            [sin(%pi), sin(---), sin(---)]
                                 2         3
```

```undefined
(%i3) [sin (%pi/4), sin (%pi/5), sin (%pi/6)];
                      %pi       %pi       %pi
(%o3)            [sin(---), sin(---), sin(---)]
                       4         5         6
```

```undefined
(%i4) %piargs : true$
```

```undefined
(%i5) [sin (%pi), sin (%pi/2), sin (%pi/3)];
                                sqrt(3)
(%o5)                    [0, 1, -------]
                                   2
```

```undefined
(%i6) [sin (%pi/4), sin (%pi/5), sin (%pi/6)];
                         1         %pi   1
(%o6)                [-------, sin(---), -]
                      sqrt(2)       5    2
```

```undefined
(%i7) [cos (%pi/3), cos (10*%pi/3), tan (10*%pi/3),
       cos (sqrt(2)*%pi/3)];
                1    1               sqrt(2) %pi
(%o7)          [-, - -, sqrt(3), cos(-----------)]
                2    2                    3
```

Some identities are applied when $\pi$ and $\pi/2$ are multiplied by an integer variable.

```undefined
(%i1) declare (n, integer, m, even)$
```

```undefined
(%i2) [sin (%pi  n), cos (%pi  m), sin (%pi/2  m),
       cos (%pi/2  m)];
                                      m/2
(%o2)                  [0, 1, 0, (- 1)   ]
```

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

Option variable: **%iargs**

Default value: `true`

When `%iargs` is `true`, trigonometric functions are simplified to hyperbolic functions when the argument is apparently a multiple of the imaginary unit $i.$

Even when the argument is demonstrably real, the simplification is applied; Maxima considers only whether the argument is a literal multiple of $i.$

Examples:

```undefined
(%i1) %iargs : false$
```

```undefined
(%i2) [sin (%i  x), cos (%i  x), tan (%i * x)];
(%o2)           [sin(%i x), cos(%i x), tan(%i x)]
```

```undefined
(%i3) %iargs : true$
```

```undefined
(%i4) [sin (%i  x), cos (%i  x), tan (%i * x)];
(%o4)           [%i sinh(x), cosh(x), %i tanh(x)]
```

Even when the argument is demonstrably real, the simplification is applied.

```undefined
(%i1) declare (x, imaginary)$
```

```undefined
(%i2) [featurep (x, imaginary), featurep (x, real)];
(%o2)                     [true, false]
```

```undefined
(%i3) sin (%i * x);
(%o3)                      %i sinh(x)
```

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) · [Hyperbolic functions](maxima_singlepage_split_102.html#Category_003a-Hyperbolic-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

Option variable: **halfangles**

Default value: `false`

When `halfangles` is `true`, trigonometric functions of arguments `expr/2` are simplified to functions of expr.

For a real argument _$x$_ in the interval $0 \le x < 2\pi,$ $\sin{x\over 2}$ simplifies to a simple formula: $$ {\sqrt{1-\cos x}\over\sqrt{2}} $$

A complicated factor is needed to make this formula correct for all complex arguments _$z = x+iy$_: $$ (-1)^{\lfloor{x/(2\pi)}\rfloor} \left\[1-\rm{unit\_step}(-y) \left(1+(-1)^{\lfloor{x/(2\pi)}\rfloor - \lceil{x/(2\pi)}\rceil}\right)\right\] $$

Maxima knows this factor and similar factors for the functions `sin`, `cos`, `sinh`, and `cosh`. For special values of the argument _$z$_ these factors simplify accordingly.

Examples:

```undefined
(%i1) halfangles : false$
```

```undefined
(%i2) sin (x / 2);
                                 x
(%o2)                        sin(-)
                                 2
```

```undefined
(%i3) halfangles : true$
```

```undefined
(%i4) sin (x / 2);
                            x
                    floor(-----)
                          2 %pi
               (- 1)             sqrt(1 - cos(x))
(%o4)          ----------------------------------
                            sqrt(2)
```

```undefined
(%i5) assume(x>0, x<2*%pi)$
```

```undefined
(%i6) sin(x / 2);
                        sqrt(1 - cos(x))
(%o6)                   ----------------
                            sqrt(2)
```

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

Option variable: **trigsign**

Default value: `true`

When `trigsign` is `true`, it permits simplification of negative arguments to trigonometric functions. E.g., $\sin(-x)$ will become $-\sin x$ only if `trigsign` is `true`.

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

---

Next: [Additional Functions](#^Additional-Functions), Previous: [Options Controlling Simplification](#^Options-Controlling-Simplification), Up: [Functions and Variables for Trigonometric](#^Functions-and-Variables-for-Trigonometric) \[[Contents](maxima_singlepage_split_000.html#SEC_Contents "Table of contents")\]\[[Index](maxima_singlepage_split_102.html#Function-and-Variable-Index "Index")\]

#### 10.5.2.3 Explicit Simplifications Using Identities

Function: **trigexpand** (expr)

Expands trigonometric and hyperbolic functions of sums of angles and of multiple angles occurring in expr. For best results, expr should be expanded. To enhance user control of simplification, this function expands only one level at a time, expanding sums of angles or multiple angles. To obtain full expansion into sines and cosines immediately, set the switch `trigexpand: true`.

`trigexpand` is governed by the following global flags:

`trigexpand`

If `true` causes expansion of all expressions containing sin’s and cos’s occurring subsequently.

`halfangles`

If `true` causes halfangles to be simplified away.

`trigexpandplus`

Controls the "sum" rule for `trigexpand`, expansion of sums (e.g. `sin(x + y)`) will take place only if `trigexpandplus` is `true`.

`trigexpandtimes`

Controls the "product" rule for `trigexpand`, expansion of products (e.g. `sin(2 x)`) will take place only if `trigexpandtimes` is `true`.

Examples:

```undefined
(%i1) x+sin(3*x)/sin(x),trigexpand=true,expand;
                         2           2
(%o1)               - sin (x) + 3 cos (x) + x
```

```undefined
(%i2) trigexpand(sin(10*x+y));
(%o2)          cos(10 x) sin(y) + sin(10 x) cos(y)
```

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) · [Simplification functions](maxima_singlepage_split_102.html#Category_003a-Simplification-functions) ·

Option variable: **trigexpandplus**

Default value: `true`

`trigexpandplus` controls the "sum" rule for `trigexpand`. Thus, when the `trigexpand` command is used or the `trigexpand` switch set to `true`, expansion of sums (e.g. `sin(x+y))` will take place only if `trigexpandplus` is `true`.

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

Option variable: **trigexpandtimes**

Default value: `true`

`trigexpandtimes` controls the "product" rule for `trigexpand`. Thus, when the `trigexpand` command is used or the `trigexpand` switch set to `true`, expansion of products (e.g. `sin(2*x)`) will take place only if `trigexpandtimes` is `true`.

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

Option variable: **triginverses**

Default value: `true`

`triginverses` controls the simplification of the composition of trigonometric and hyperbolic functions with their inverse functions.

If `all`, both _e.g._ `atan(tan(x))` and `tan(atan(x))` simplify to x.

If `true`, the `arcfun(fun(x))` simplification is turned off.

If `false`, both the `arcfun(fun(x))` and `fun(arcfun(x))` simplifications are turned off.

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) · [Simplification flags and variables](maxima_singlepage_split_102.html#Category_003a-Simplification-flags-and-variables) ·

Function: **trigreduce**  
**trigreduce** (expr, x)  
**trigreduce** (expr)

Combines products and powers of trigonometric and hyperbolic sin’s and cos’s of x into those of multiples of x. It also tries to eliminate these functions when they occur in denominators. If x is omitted then all variables in expr are used.

See also `poissimp`.

```undefined
(%i1) trigreduce(-sin(x)^2+3*cos(x)^2+x);
               cos(2 x)      cos(2 x)   1        1
(%o1)          -------- + 3 (-------- + -) + x - -
                  2             2       2        2
```

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) · [Simplification functions](maxima_singlepage_split_102.html#Category_003a-Simplification-functions) ·

Function: **trigsimp** (expr)

Employs the identities $\sin\left(x\right)^2 + \cos\left(x\right)^2 = 1$ and $\cosh\left(x\right)^2 - \sinh\left(x\right)^2 = 1$ to simplify expressions containing `tan`, `sec`, etc., to `sin`, `cos`, `sinh`, `cosh`.

`trigreduce`, `ratsimp`, and `radcan` may be able to further simplify the result.

`demo ("trgsmp.dem")` displays some examples of `trigsimp`.

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) · [Simplification functions](maxima_singlepage_split_102.html#Category_003a-Simplification-functions) ·

Function: **trigrat** (expr)

Gives a canonical simplified quasilinear form of a trigonometrical expression; expr is a rational fraction of several `sin`, `cos` or `tan`, the arguments of them are linear forms in some variables (or kernels) and `%pi/n` (n integer) with integer coefficients. The result is a simplified fraction with numerator and denominator linear in `sin` and `cos`. Thus `trigrat` linearize always when it is possible.

```undefined
(%i1) trigrat(sin(3*a)/sin(a+%pi/3));
(%o1)            sqrt(3) sin(2 a) + cos(2 a) - 1
```

The following example is taken from Davenport, Siret, and Tournier, _Calcul Formel_, Masson (or in English, Addison-Wesley), section 1.5.5, Morley theorem.

```undefined
(%i1) c : %pi/3 - a - b$
```

```undefined
(%i2) bc : sin(a)*sin(3*c)/sin(a+b);
                                          %pi
                  sin(a) sin(3 (- b - a + ---))
                                           3
(%o2)             -----------------------------
                           sin(b + a)
```

```undefined
(%i3) ba : bc, c=a, a=c;
                                         %pi
                    sin(3 a) sin(b + a - ---)
                                          3
(%o3)               -------------------------
                                  %pi
                          sin(a - ---)
                                   3
```

```undefined
(%i4) ac2 : ba^2 + bc^2 - 2*bc*ba*cos(b);
         2         2         %pi
      sin (3 a) sin (b + a - ---)
                              3
(%o4) ---------------------------
                2     %pi
             sin (a - ---)
                       3
                                       %pi
 - (2 sin(a) sin(3 a) sin(3 (- b - a + ---)) cos(b)
                                        3
             %pi            %pi
 sin(b + a - ---))/(sin(a - ---) sin(b + a))
              3              3
      2       2              %pi
   sin (a) sin (3 (- b - a + ---))
                              3
 + -------------------------------
                2
             sin (b + a)
```

```undefined
(%i5) trigrat (ac2);
(%o5) - (sqrt(3) sin(4 b + 4 a) - cos(4 b + 4 a)
 - 2 sqrt(3) sin(4 b + 2 a) + 2 cos(4 b + 2 a)
 - 2 sqrt(3) sin(2 b + 4 a) + 2 cos(2 b + 4 a)
 + 4 sqrt(3) sin(2 b + 2 a) - 8 cos(2 b + 2 a) - 4 cos(2 b - 2 a)
 + sqrt(3) sin(4 b) - cos(4 b) - 2 sqrt(3) sin(2 b) + 10 cos(2 b)
 + sqrt(3) sin(4 a) - cos(4 a) - 2 sqrt(3) sin(2 a) + 10 cos(2 a)
 - 9)/4
```

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) · [Simplification functions](maxima_singlepage_split_102.html#Category_003a-Simplification-functions) ·

---

Previous: [Explicit Simplifications Using Identities](#^Explicit-Simplifications-Using-Identities), Up: [Functions and Variables for Trigonometric](#^Functions-and-Variables-for-Trigonometric) \[[Contents](maxima_singlepage_split_000.html#SEC_Contents "Table of contents")\]\[[Index](maxima_singlepage_split_102.html#Function-and-Variable-Index "Index")\]

#### 10.5.2.4 Additional Functions

Package: **atrig1**

The `atrig1` package contains several additional simplification rules for inverse trigonometric functions. Together with rules already known to Maxima, the following angles are fully implemented: _$0$_, $\pi/6,$ $\pi/4,$ $\pi/3,$ and $\pi/2.$ Corresponding angles in the other three quadrants are also available. Do `load("atrig1");` to use them.

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) · [Package atrig1](maxima_singlepage_split_102.html#Category_003a-Package-atrig1) ·

Package: **ntrig**

The `ntrig` package contains a set of simplification rules that are used to simplify trigonometric function whose arguments are of the form `f(n %pi/10)` where f is any of the functions `sin`, `cos`, `tan`, `csc`, `sec` and `cot`.

Categories: [Trigonometric functions](maxima_singlepage_split_102.html#Category_003a-Trigonometric-functions) · [Package ntrig](maxima_singlepage_split_102.html#Category_003a-Package-ntrig) ·

---

Previous: [Trigonometric Functions](#^Trigonometric-Functions), Up: [Elementary Functions](maxima_singlepage_split_009.html#Elementary-Functions) \[[Contents](maxima_singlepage_split_000.html#SEC_Contents "Table of contents")\]\[[Index](maxima_singlepage_split_102.html#Function-and-Variable-Index "Index")\]

### 10.6 Random Numbers

Function: **make_random_state**  
**make_random_state** (n)  
**make_random_state** (s)  
**make_random_state** (true)  
**make_random_state** (false)

A random state object represents the state of the random number generator. The state comprises 627 32-bit words.

`make_random_state (n)` returns a new random state object created from an integer seed value equal to n modulo 2^32. n may be negative.

`make_random_state (s)` returns a copy of the random state s.

`make_random_state (true)` returns a new random state object, using the current computer clock time as the seed.

`make_random_state (false)` returns a copy of the current state of the random number generator.

Categories: [Random numbers](maxima_singlepage_split_102.html#Category_003a-Random-numbers) ·

Function: **set_random_state** (s)

Copies s to the random number generator state.

`set_random_state` always returns `done`.

Categories: [Random numbers](maxima_singlepage_split_102.html#Category_003a-Random-numbers) ·

Function: **random** (x)

Returns a pseudorandom number. If x is an integer, `random (x)` returns an integer from 0 through `x - 1` inclusive. If x is a floating point number, `random (x)` returns a nonnegative floating point number less than x. `random` complains with an error if x is neither an integer nor a float, or if x is not positive.

The functions `make_random_state` and `set_random_state` maintain the state of the random number generator.

The Maxima random number generator is an implementation of the Mersenne twister MT 19937.

Examples:

```undefined
(%i1) s1: make_random_state (654321)$
```

```undefined
(%i2) set_random_state (s1);
(%o2)                         done
```

```undefined
(%i3) random (1000);
(%o3)                          768
```

```undefined
(%i4) random (9573684);
(%o4)                        7657880
```

```undefined
(%i5) random (2^75);
(%o5)                11804491615036831636390
```

```undefined
(%i6) s2: make_random_state (false)$
```

```undefined
(%i7) random (1.0);
(%o7)                  0.2310127244107132
```

```undefined
(%i8) random (10.0);
(%o8)                  4.3945536458708245
```

```undefined
(%i9) random (100.0);
(%o9)                   32.28666704056853
```

```undefined
(%i10) set_random_state (s2);
(%o10)                        done
```

```undefined
(%i11) random (1.0);
(%o11)                 0.2310127244107132
```

```undefined
(%i12) random (10.0);
(%o12)                 4.3945536458708245
```

```undefined
(%i13) random (100.0);
(%o13)                  32.28666704056853
```

Categories: [Random numbers](maxima_singlepage_split_102.html#Category_003a-Random-numbers) · [Numerical methods](maxima_singlepage_split_102.html#Category_003a-Numerical-methods) ·

---

Next: [Plotting](maxima_singlepage_split_011.html#Plotting), Previous: [Elementary Functions](maxima_singlepage_split_009.html#Elementary-Functions) \[[Contents](maxima_singlepage_split_000.html#SEC_Contents "Table of contents")\]\[[Index](maxima_singlepage_split_102.html#Function-and-Variable-Index "Index")\]