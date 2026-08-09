document.addEventListener('click', e => {
    const card = e.target.closest('[data-popup]');
    const close = e.target.closest('[data-close-popup]');
    const toggle = e.target.closest('.custom-select-toggle');
    const option = e.target.closest('.custom-select-option, .option-value');
    const atc = e.target.closest('.popup-atc');

    if(card) {
        document.getElementById(card.dataset.popup).classList.add('active');
        return;
    }
    if(close) {
        close.closest('.popup-overlay').classList.remove('active');
        return;
    }
    if(toggle) {
        const select = toggle.closest('.custom-select');

        document.querySelectorAll('.custom-select.open').forEach(item => {
            if(item !== select) item.classList.remove('open');
        });

        select.classList.toggle('open');
        return;
    }

    if (option) {
        const popup = option.closest('.popup');
        const group = option.closest('.product-option');
        const variants = JSON.parse(popup.querySelector('.product-variants').textContent);

        group.querySelectorAll('.custom-select-option.selected, .option-value.selected')
            .forEach(item => item.classList.remove('selected'));

        option.classList.add('selected');

        const select = option.closest('.custom-select');
        if (select) {
            select.querySelector('.custom-select-toggle span').textContent = option.dataset.optionValue;
            select.querySelector('.custom-select-toggle').classList.add('selected');
            select.classList.remove('open');
        }

        const selected = [];

        popup.querySelectorAll('.product-option').forEach(group => {
            const position = Number(group.dataset.optionPosition);
            const selectedOption = group.querySelector(
                '.custom-select-option.selected, .option-value.selected'
            );

            selected[position - 1] = selectedOption?.dataset.optionValue;
        });

        const variant = selected.every(Boolean)
            ? variants.find(variant =>
                selected.every((value, index) =>
                variant[`option${index + 1}`] === value
            )
        ) : null;

        popup.querySelector('[name="id"]').value = variant?.id || '';
        return;
    }

    if (atc) {
        const popup = atc.closest('.popup');
        const form = atc.closest('.popup-form');
        const message = form.querySelector('.variant-message');
        const id = Number(form.querySelector('[name="id"]').value);
        const variants = JSON.parse(popup.querySelector('.product-variants').textContent);

        if(!id) {
            const missing = [...popup.querySelectorAll('.product-option')]
                .filter(group => !group.querySelector(
                    '.custom-select-option.selected, .option-value.selected'
                ))
                .map(group => group.querySelector('label').textContent.trim());

                message.textContent = missing.length
                    ? `Please select ${missing.join(' and ')}`
                    : `This combination is unavailable`;

                return;
        }

        const variant = variants.find(variant => variant.id === id);

        if (!variant) {
            message.textContent = 'This combination is unavailable';
            return;
        }

        const hasBlack = variant.options.some(
            value => value.toLowerCase() === 'black'
        );
        const hasMedium = variant.options.some(
            value => value.toLowerCase() === 'm'
        );

        const items = [{
            id,
            quantity: 1
        }];

        const autoProduct = popup.querySelector('.auto-add-product');

        if(hasBlack && hasMedium && autoProduct) {
            const autoProductData = JSON.parse(autoProduct.textContent);

            if(autoProductData.id) {
                items.push({
                    id: Number(autoProductData.id),
                    quantity: 1
                });
            }
        }

        message.textContent = '';
        atc.classList.add('loading');

        fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({ items })
        })
        .then(response => {
            if(!response.ok) throw new Error();
            return response.json();
        })
        .then(async cartData => {
            document.dispatchEvent(
                new CustomEvent('cart:update', {
                    detail: {
                        data: cartData
                    }
                })
            );

            if(window.theme?.cart?.update) {
                await window.theme.cart.update();
            }

            const cartIcon =
                document.querySelector('cart-icon-component') || document.querySelector('[data-cart-icon]');

                if(cartIcon?.update) {
                    cartIcon.up(cartData);
                }
                atc.classList.remove('loading');
                atc.querySelector('.atc-text').textContent = 'ADDED TO CART';

                setTimeout(() => {
                    atc.querySelector('.atc-text').textContent = 'ADD TO CART';
                }, 1500);
        });
        return;
    }
    if(e.target.classList.contains('popup-overlay')) {
        e.target.classList.remove('active');
    }
});