# Math Formulas and Images in Markdown

This article demonstrates how to use mathematical formulas and images in Markdown articles.

## Inline Math

You can write inline math formulas using single dollar signs: $E = mc^2$ or $f(x) = x^2 + 2x + 1$.

## Block Math

For display formulas, use double dollar signs:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\frac{d}{dx}\left( \int_{0}^{x} f(u)\,du\right)=f(x)
$$

## Complex Formulas

Here's a more complex example:

$$
\begin{aligned}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &= \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} &= 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} &= \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} &= 0
\end{aligned}
$$

## Images

You can include images using Markdown syntax:

![Example Image](https://via.placeholder.com/600x300?text=Example+Image "Optional title")

Or with a relative path (if the image is in the article folder):

![Local Image](./image.png "Local image")

## Combining Text and Math

The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.

For the normal distribution, the probability density function is:

$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}
$$

Where $\mu$ is the mean and $\sigma$ is the standard deviation.
